<?php

namespace App\Http\Controllers\Company;

use App\Enums\BillingStatus;
use App\Enums\JobPostingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\JobPosting\JobPostingRequest;
use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class JobPostingController extends Controller
{
    /**
     * 認証中の企業自身の求人一覧。各求人にいいね数(=応募数)を付与し、
     * 一覧カードのサムネイル表示用に求人画像も含める
     */
    public function index(Request $request): JsonResponse
    {
        $jobPostings = $request->user('company')->jobPostings()
            ->withCount('likes')
            ->with('jobPostingImages')
            ->latest()
            ->get();

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

    public function show(Request $request, int $jobPosting): JsonResponse
    {
        $model = $this->findOwn($request, $jobPosting)->loadCount('likes')->load('jobPostingImages');

        return response()->json($model);
    }

    public function update(JobPostingRequest $request, int $jobPosting): JsonResponse
    {
        $model = $this->findOwn($request, $jobPosting);

        $model->update($request->validated());

        return response()->json($model);
    }

    public function destroy(Request $request, int $jobPosting): Response
    {
        $this->findOwn($request, $jobPosting)->delete();

        return response()->noContent();
    }

    /**
     * 求人を公開する。下書き(初回公開)、課金失敗で自動非公開になった求人
     * (支払い方法更新後の再公開)、募集終了した求人(再募集)のいずれかからのみ遷移できる。
     * 「決済が有効な間は求人を何件でも掲載できる」(REQUIREMENTS.md 4.4)という要件のため、
     * 課金ステータスが課金中でない場合はここで拒否する(未契約のまま/未払いのままでは公開できない)。
     * published_atは初回公開日時のため、再公開(公開→非公開/終了→再公開)では上書きしない
     */
    public function publish(Request $request, int $jobPosting): JsonResponse
    {
        $company = $request->user('company');
        $model = $this->findOwn($request, $jobPosting);

        if (! in_array($model->status, [JobPostingStatus::Draft, JobPostingStatus::Unpublished, JobPostingStatus::Closed], true)) {
            throw ValidationException::withMessages([
                'status' => ['下書き、非公開、または募集終了状態の求人のみ公開できます。'],
            ]);
        }

        if ($company->billingStatus() !== BillingStatus::Active) {
            throw ValidationException::withMessages([
                'billing' => ['求人を公開するには、課金設定(サブスクリプション)を有効にしてください。'],
            ]);
        }

        $model->update([
            'status' => JobPostingStatus::Published,
            'published_at' => $model->published_at ?? now(),
        ]);

        return response()->json($model);
    }

    /**
     * 公開中の求人を下書きに戻す(編集のための一時的な非公開)
     */
    public function unpublish(Request $request, int $jobPosting): JsonResponse
    {
        $model = $this->findOwn($request, $jobPosting);

        if ($model->status !== JobPostingStatus::Published) {
            throw ValidationException::withMessages([
                'status' => ['公開中の求人のみ非公開にできます。'],
            ]);
        }

        $model->update(['status' => JobPostingStatus::Draft]);

        return response()->json($model);
    }

    /**
     * 募集を終了する。closed状態でも企業がpublishエンドポイントを叩けば再募集できる
     */
    public function close(Request $request, int $jobPosting): JsonResponse
    {
        $model = $this->findOwn($request, $jobPosting);

        if ($model->status === JobPostingStatus::Closed) {
            throw ValidationException::withMessages([
                'status' => ['この求人はすでに募集を終了しています。'],
            ]);
        }

        $model->update(['status' => JobPostingStatus::Closed]);

        return response()->json($model);
    }

    /**
     * company()->jobPostings()経由でIDを引くことで、他社の求人を閲覧・編集・削除できないようスコープする
     * (存在しないIDと同様404を返すため、他社のレコードの存在有無も推測されない)
     */
    private function findOwn(Request $request, int $jobPosting): JobPosting
    {
        return $request->user('company')->jobPostings()->findOrFail($jobPosting);
    }
}
