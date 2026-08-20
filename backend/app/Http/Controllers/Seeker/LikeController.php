<?php

namespace App\Http\Controllers\Seeker;

use App\Enums\LikeStatus;
use App\Enums\LikeType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Like\LikeRequest;
use App\Notifications\NewApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
     * 求人への「いいね」(=応募)。重複応募チェック・月間上限チェックはLikeRequest側で行う
     */
    public function store(LikeRequest $request): JsonResponse
    {
        $appliedAt = now();

        $like = $request->user('web')->likes()->create([
            ...$request->validated(),
            'status' => LikeStatus::Applied->value,
            'applied_at' => $appliedAt,
            // response_deadlineはapplied_atの7日後(DB_DESIGN.mdの方針)
            'response_deadline' => $appliedAt->copy()->addDays(7),
        ]);

        $like->jobPosting->company->notify(new NewApplication($like));

        return response()->json($like, 201);
    }

    /**
     * 認証中の求職者の今月の残りいいね数(通常・スーパー別枠)。
     * 上限・集計ロジックはLikeRequestの応募時バリデーションと同じ基準に揃える
     */
    public function remaining(Request $request): JsonResponse
    {
        $user = $request->user('web');

        $remaining = collect(LikeType::cases())->mapWithKeys(function (LikeType $likeType) use ($user) {
            $limit = $likeType->monthlyLimit();

            $used = $user->likes()
                ->where('like_type', $likeType->value)
                ->whereBetween('applied_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->count();

            return [$likeType->value => [
                'limit' => $limit,
                'used' => $used,
                'remaining' => max($limit - $used, 0),
            ]];
        });

        return response()->json($remaining);
    }
}
