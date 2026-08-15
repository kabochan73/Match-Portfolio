<?php

namespace App\Http\Controllers\Seeker;

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
     * 求職者のプロフィール画像を登録・差し替えする
     */
    public function update(UpdateImageRequest $request): JsonResponse
    {
        $user = $request->user('web');

        $this->deleteProfileImage($user->avatar_path);

        $user->avatar_path = $this->storeProfileImage($request->file('image'), 'avatars/users');
        $user->save();

        return response()->json($user);
    }

    /**
     * 求職者のプロフィール画像を削除する
     */
    public function destroy(Request $request): Response
    {
        $user = $request->user('web');

        $this->deleteProfileImage($user->avatar_path);

        $user->avatar_path = null;
        $user->save();

        return response()->noContent();
    }
}
