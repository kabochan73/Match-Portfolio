<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Concerns\HandlesProfileImageUploads;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateImageRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AvatarController extends Controller
{
    use HandlesProfileImageUploads;

    /**
     * 企業のプロフィール画像(ロゴ等)を登録・差し替えする
     */
    public function update(UpdateImageRequest $request): JsonResponse
    {
        $company = $request->user('company');

        $this->deleteProfileImage($company->avatar_path);

        $company->avatar_path = $this->storeProfileImage($request->file('image'), 'avatars/companies');
        $company->save();

        return response()->json($company);
    }

    /**
     * 企業のプロフィール画像を削除する
     */
    public function destroy(Request $request): Response
    {
        $company = $request->user('company');

        $this->deleteProfileImage($company->avatar_path);

        $company->avatar_path = null;
        $company->save();

        return response()->noContent();
    }
}
