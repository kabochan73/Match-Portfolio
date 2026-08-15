<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\UpdateUserProfileRequest;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    /**
     * 求職者の基本プロフィール(氏名・自己紹介コメント・ポートフォリオURL・生年月日)を更新する。
     * 画像(アバター)はAvatarControllerで別管理
     */
    public function update(UpdateUserProfileRequest $request): JsonResponse
    {
        $user = $request->user('web');

        $user->update($request->validated());

        return response()->json($user);
    }
}
