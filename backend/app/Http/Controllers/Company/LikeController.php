<?php

namespace App\Http\Controllers\Company;

use App\Enums\LikeStatus;
use App\Http\Controllers\Controller;
use App\Models\Like;
use App\Notifications\LikeMatched;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class LikeController extends Controller
{
    /**
     * 認証中の企業自身の求人への応募者一覧。like_typeを含めて返すことで、
     * フロント側で通常のいいねとスーパーいいねを視覚的に区別できるようにする。
     * 自分が一覧から非表示にした応募者(hide参照)は除く
     */
    public function index(Request $request, int $jobPosting): JsonResponse
    {
        $jobPosting = $request->user('company')->jobPostings()->findOrFail($jobPosting);

        $likes = $jobPosting->likes()
            ->whereNull('company_hidden_at')
            ->with('user:id,name,avatar_path,birth_date')
            ->latest('applied_at')
            ->get();

        return response()->json($likes);
    }

    /**
     * 応募者のプロフィール詳細(職歴・学歴・資格・志望動機を含む)。自社の求人への応募のみ閲覧可能。
     * userはログインID(email)を含まない列に絞る(企業向けに公開してよいプロフィール項目のみ)
     */
    public function show(Request $request, int $like): JsonResponse
    {
        $model = $this->findOwn($request, $like)
            ->load([
                'user' => fn ($query) => $query->select('id', 'name', 'comment', 'portfolio_url', 'birth_date', 'avatar_path'),
                'user.workExperiences',
                'user.educations',
                'user.certifications',
            ]);

        return response()->json($model);
    }

    /**
     * 応募者へ「気になる」を送りマッチ成立させる。反応待ち(applied)かつ反応期限内の応募にのみ許可する。
     * 期限切れはlikes:expireバッチ(1時間おき)がexpiredへ更新するが、バッチ実行前の取りこぼしに
     * 備えてここでも二重にチェックする
     */
    public function match(Request $request, int $like): JsonResponse
    {
        $model = $this->findOwn($request, $like);

        if ($model->status !== LikeStatus::Applied->value || $model->response_deadline->isPast()) {
            throw ValidationException::withMessages([
                'status' => ['反応待ちの応募のみ「気になる」を送れます。'],
            ]);
        }

        $model->update([
            'status' => LikeStatus::Matched->value,
            'company_responded_at' => now(),
        ]);

        $model->user->notify(new LikeMatched($model));

        return response()->json($model);
    }

    /**
     * 応募者を自分の応募者一覧から非表示にする。Seeker\MessageThreadController::hide/
     * Company\MessageThreadController::hideと同じcompany_hidden_at列を使い回すため、
     * マッチ成立済みでメッセージスレッドが存在する場合はそちらも同時に一覧から消える
     * (相手からの新着メッセージが来れば自動的に再表示される)。
     * 求職者側のhide(Seeker\LikeController)と違い、公開中の求人への応募かどうかは問わない
     * (企業視点では「対応済みの応募者を一覧から片付ける」操作であり、求人自体は他の応募者を
     * 受け付け続けられるため、求職者側のような取り消し防止の制約は不要)
     */
    public function hide(Request $request, int $like): Response
    {
        $model = $this->findOwn($request, $like);

        $model->update(['company_hidden_at' => now()]);

        return response()->noContent();
    }

    /**
     * likes.jobPosting経由で自社の求人への応募かをスコープする
     * (存在しないIDと同様404を返すため、他社への応募者の存在有無も推測されない)
     */
    private function findOwn(Request $request, int $like): Like
    {
        return Like::query()
            ->whereHas('jobPosting', fn ($query) => $query->where('company_id', $request->user('company')->id))
            ->findOrFail($like);
    }
}
