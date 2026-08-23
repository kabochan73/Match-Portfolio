<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateCompanyProfileRequest;
use App\Services\NextjsRevalidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * 認証済み企業自身のプロフィールを返す。Seeker\ProfileController::show()と同じ理由
     * (プロフィール画面を直接開いた場合・再読み込みした場合に値を取得する手段が必要)
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json($request->user('company')->load('images'));
    }

    /**
     * 企業の基本プロフィール(会社名・会社概要・電話番号・所在地・設立年・メンバー数・WebサイトURL)を更新する。
     * 画像(ロゴ・写真ギャラリー)はAvatarController/CompanyImageControllerで別管理
     */
    public function update(UpdateCompanyProfileRequest $request, NextjsRevalidationService $revalidator): JsonResponse
    {
        $company = $request->user('company');

        $company->update($request->validated());

        $revalidator->revalidate("company-{$company->id}");

        return response()->json($company->load('images'));
    }
}
