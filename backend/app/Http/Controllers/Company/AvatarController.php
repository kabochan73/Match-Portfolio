<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Concerns\HandlesProfileImageUploads;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateImageRequest;
use App\Services\NextjsRevalidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AvatarController extends Controller
{
    use HandlesProfileImageUploads;

    /**
     * 企業のプロフィール画像(ロゴ等)を登録・差し替えする。avatar_urlは公開企業プロフィールにも
     * 求人詳細ページ(company列に埋め込み)にも表示されるため、Company\ProfileController::update()
     * と同様にrevalidateCompanyProfile()でISRのオンデマンド再検証を行う
     */
    public function update(UpdateImageRequest $request, NextjsRevalidationService $revalidator): JsonResponse
    {
        $company = $request->user('company');

        $this->deleteProfileImage($company->avatar_path);

        $company->avatar_path = $this->storeProfileImage($request->file('image'), 'avatars/companies');
        $company->save();

        $revalidator->revalidateCompanyProfile($company);

        return response()->json($company->load('images'));
    }

    /**
     * 企業のプロフィール画像を削除する
     */
    public function destroy(Request $request, NextjsRevalidationService $revalidator): Response
    {
        $company = $request->user('company');

        $this->deleteProfileImage($company->avatar_path);

        $company->avatar_path = null;
        $company->save();

        $revalidator->revalidateCompanyProfile($company);

        return response()->noContent();
    }
}
