<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Concerns\HandlesProfileImageUploads;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateImageRequest;
use App\Services\NextjsRevalidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

/**
 * 企業プロフィールに添付する写真ギャラリー(最大5枚。job_posting_imagesと同じ仕組み)の登録・削除。
 * position列は並び替え用に用意されているが、job_posting_imagesと同様、現状は登録順(=末尾に追加)を
 * そのまま表示順にしており、並び替えのUI/エンドポイントはまだない
 */
class CompanyImageController extends Controller
{
    use HandlesProfileImageUploads;

    private const MAX_IMAGES = 5;

    public function store(UpdateImageRequest $request, NextjsRevalidationService $revalidator): JsonResponse
    {
        $company = $request->user('company');

        if ($company->images()->count() >= self::MAX_IMAGES) {
            throw ValidationException::withMessages([
                'image' => ['画像は5枚まで登録できます。'],
            ]);
        }

        $path = $this->storeProfileImage($request->file('image'), 'company-images');
        // 削除で歯抜けが生じても末尾に追記できるよう、現在の最大position+1を採番する
        $nextPosition = ($company->images()->max('position') ?? -1) + 1;

        $image = $company->images()->create([
            'path' => $path,
            'position' => $nextPosition,
        ]);

        // 写真ギャラリーは公開企業プロフィールにも表示されるため、
        // Company\ProfileController::update()と同様にISRのオンデマンド再検証を行う
        $revalidator->revalidate("company-{$company->id}");

        return response()->json($image, 201);
    }

    public function destroy(Request $request, int $image, NextjsRevalidationService $revalidator): Response
    {
        $company = $request->user('company');
        $companyImage = $company->images()->findOrFail($image);

        $this->deleteProfileImage($companyImage->path);
        $companyImage->delete();

        $revalidator->revalidate("company-{$company->id}");

        return response()->noContent();
    }
}
