<?php

namespace App\Http\Controllers\Company;

use App\Enums\LikeStatus;
use App\Http\Controllers\Controller;
use App\Models\Like;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LikeController extends Controller
{
    /**
     * 認証中の企業自身の求人への応募者一覧。like_typeを含めて返すことで、
     * フロント側で通常のいいねとスーパーいいねを視覚的に区別できるようにする
     */
    public function index(Request $request, int $jobPosting): JsonResponse
    {
        $jobPosting = $request->user('company')->jobPostings()->findOrFail($jobPosting);

        $likes = $jobPosting->likes()
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

        return response()->json($model);
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
