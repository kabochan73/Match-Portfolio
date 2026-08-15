<?php

namespace App\Http\Controllers\Company;

use App\Enums\JobPostingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\JobPosting\JobPostingRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class JobPostingController extends Controller
{
    /**
     * 認証中の企業自身の求人一覧。各求人にいいね数(=応募数)を付与する
     */
    public function index(Request $request): JsonResponse
    {
        $jobPostings = $request->user('company')->jobPostings()->withCount('likes')->latest()->get();

        return response()->json($jobPostings);
    }

    public function store(JobPostingRequest $request): JsonResponse
    {
        // status/published_atはここでは受け付けない。作成直後は必ずdraft(公開はpublishエンドポイント経由)。
        // DBカラム側にもdefault('draft')があるが、それだけだとcreate()直後のモデルのstatus属性が
        // (DBには保存されていても)nullのままレスポンスされてしまうため、ここで明示的に指定する
        $jobPosting = $request->user('company')->jobPostings()->create([
            ...$request->validated(),
            'status' => JobPostingStatus::Draft,
        ]);

        return response()->json($jobPosting, 201);
    }

    /**
     * company()->jobPostings()経由でIDを引くことで、他社の求人を閲覧・編集・削除できないようスコープする
     * (存在しないIDと同様404を返すため、他社のレコードの存在有無も推測されない)
     */
    public function show(Request $request, int $jobPosting): JsonResponse
    {
        $model = $request->user('company')->jobPostings()->withCount('likes')->findOrFail($jobPosting);

        return response()->json($model);
    }

    public function update(JobPostingRequest $request, int $jobPosting): JsonResponse
    {
        $model = $request->user('company')->jobPostings()->findOrFail($jobPosting);

        $model->update($request->validated());

        return response()->json($model);
    }

    public function destroy(Request $request, int $jobPosting): Response
    {
        $request->user('company')->jobPostings()->findOrFail($jobPosting)->delete();

        return response()->noContent();
    }
}
