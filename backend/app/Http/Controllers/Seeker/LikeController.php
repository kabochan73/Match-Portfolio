<?php

namespace App\Http\Controllers\Seeker;

use App\Enums\LikeStatus;
use App\Enums\LikeType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Like\LikeRequest;
use App\Models\User;
use App\Notifications\NewApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LikeController extends Controller
{
    /**
     * 認証中の求職者自身の応募状況一覧。新しい応募が先頭に来るようapplied_atの降順で返す
     */
    public function index(Request $request): JsonResponse
    {
        $likes = $request->user('web')->likes()
            ->with([
                'jobPosting:id,company_id,title,employment_type,prefecture,salary_min,salary_max,status',
                'jobPosting.company:id,name',
                'jobPosting.jobPostingImages',
            ])
            ->latest('applied_at')
            ->get();

        return response()->json($likes);
    }

    /**
     * 求人への「いいね」(=応募)。重複応募チェック(DBのpartial unique indexで担保)・
     * 月間上限チェック(LikeRequestで即時フィードバック)を経た上で、月間上限は
     * ここでもユーザー行をロックした上で再検証する。LikeRequestのチェックはロックなしのため、
     * 同時リクエスト(ダブルクリック・複数タブ)が両方ともチェックを通過した後に
     * 両方ともinsertされてしまう競合状態を防ぐのが目的
     */
    public function store(LikeRequest $request): JsonResponse
    {
        $likeType = LikeType::from($request->validated('like_type'));

        $like = DB::transaction(function () use ($request, $likeType) {
            // 同一ユーザーの行をロックすることで、このユーザーからの同時リクエストを直列化する
            $user = User::whereKey($request->user('web')->id)->lockForUpdate()->first();

            $limit = $likeType->monthlyLimit();
            $usedThisMonth = $user->likesUsedThisMonth($likeType);

            if ($usedThisMonth >= $limit) {
                $label = $likeType === LikeType::Super ? 'スーパーいいね' : '通常のいいね';
                throw ValidationException::withMessages([
                    'like_type' => "今月の{$label}の上限({$limit}件)に達しています。",
                ]);
            }

            $appliedAt = now();

            return $user->likes()->create([
                ...$request->validated(),
                'status' => LikeStatus::Applied->value,
                'applied_at' => $appliedAt,
                // response_deadlineはapplied_atの7日後(DB_DESIGN.mdの方針)
                'response_deadline' => $appliedAt->copy()->addDays(7),
            ]);
        });

        $like->jobPosting->company->notify(new NewApplication($like));

        return response()->json($like, 201);
    }

    /**
     * 認証中の求職者の今月の残りいいね数(通常・スーパー別枠)。
     * 上限・集計ロジックはUser::likesUsedThisMonth()に集約し、LikeRequestの
     * 応募時バリデーション・LikeController::storeの再検証と同じ基準に揃える
     */
    public function remaining(Request $request): JsonResponse
    {
        $user = $request->user('web');

        $remaining = collect(LikeType::cases())->mapWithKeys(function (LikeType $likeType) use ($user) {
            $limit = $likeType->monthlyLimit();
            $used = $user->likesUsedThisMonth($likeType);

            return [$likeType->value => [
                'limit' => $limit,
                'used' => $used,
                'remaining' => max($limit - $used, 0),
            ]];
        });

        return response()->json($remaining);
    }
}
