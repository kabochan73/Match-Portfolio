<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Concerns\HandlesProfileImageUploads;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateImageRequest;
use App\Models\JobPosting;
use App\Services\NextjsRevalidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

/**
 * 求人に添付する画像(最大5枚。DB_DESIGN.md参照)の登録・削除。
 * position列は並び替え用に用意されているが、現状は登録順(=末尾に追加)を
 * そのまま表示順にしており、並び替えのUI/エンドポイントはまだない
 */
class JobPostingImageController extends Controller
{
    use HandlesProfileImageUploads;

    private const MAX_IMAGES = 5;

    public function store(UpdateImageRequest $request, int $jobPosting, NextjsRevalidationService $revalidator): JsonResponse
    {
        $model = $this->findOwn($request, $jobPosting);

        if ($model->jobPostingImages()->count() >= self::MAX_IMAGES) {
            throw ValidationException::withMessages([
                'image' => ['画像は1求人につき5枚まで登録できます。'],
            ]);
        }

        $path = $this->storeProfileImage($request->file('image'), 'job-postings');
        // 削除で歯抜けが生じても末尾に追記できるよう、現在の最大position+1を採番する
        $nextPosition = ($model->jobPostingImages()->max('position') ?? -1) + 1;

        $image = $model->jobPostingImages()->create([
            'path' => $path,
            'position' => $nextPosition,
        ]);

        // 求人画像は公開求人詳細・一覧のカードにも表示されるため、
        // Company\JobPostingController(update等)と同様にISRのオンデマンド再検証を行う
        $revalidator->revalidate("job-posting-{$model->id}");
        // /companies/[id]の掲載求人一覧(company-{id}タグ)のサムネイルにも即時反映する
        $revalidator->revalidate("company-{$model->company_id}");

        return response()->json($image, 201);
    }

    public function destroy(Request $request, int $jobPosting, int $image, NextjsRevalidationService $revalidator): Response
    {
        $model = $this->findOwn($request, $jobPosting);
        $jobPostingImage = $model->jobPostingImages()->findOrFail($image);

        $this->deleteProfileImage($jobPostingImage->path);
        $jobPostingImage->delete();

        $revalidator->revalidate("job-posting-{$model->id}");
        $revalidator->revalidate("company-{$model->company_id}");

        return response()->noContent();
    }

    /**
     * company()->jobPostings()経由でIDを引くことで、他社の求人の画像を操作できないようスコープする
     */
    private function findOwn(Request $request, int $jobPosting): JobPosting
    {
        return $request->user('company')->jobPostings()->findOrFail($jobPosting);
    }
}
