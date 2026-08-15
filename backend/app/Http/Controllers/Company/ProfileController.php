<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateCompanyProfileRequest;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    /**
     * 企業の基本プロフィール(会社名・会社概要・電話番号・所在地・設立年・メンバー数・WebサイトURL)を更新する。
     * 画像(ロゴ・カバー画像)はAvatarController/CoverImageControllerで別管理
     */
    public function update(UpdateCompanyProfileRequest $request): JsonResponse
    {
        $company = $request->user('company');

        $company->update($request->validated());

        return response()->json($company);
    }
}
