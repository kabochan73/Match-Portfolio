<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateUserProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * 認証済み求職者自身のプロフィールを返す。マイページを直接開いた場合や再読み込みした場合、
     * ログイン時のレスポンスに含まれるユーザー情報はもう使えないため、この取得用エンドポイントが必要
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json($request->user('web'));
    }

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
