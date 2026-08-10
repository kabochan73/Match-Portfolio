<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class RegisteredUserController extends Controller
{
    /**
     * 求職者の会員登録。メール認証は要件に含まれないため、登録と同時にログイン状態にする
     */
    public function store(RegisterUserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        Auth::guard('web')->login($user);

        // セッション固定化攻撃(session fixation)対策として、ログイン成功時はセッションIDを再発行する
        $request->session()->regenerate();

        return response()->json($user, 201);
    }
}
