<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordUserRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetLinkController extends Controller
{
    /**
     * 求職者向けのパスワードリセットリンクをメール送信する。
     * 存在しないメールアドレスかどうかはPassword::sendResetLink()のステータスとして区別される
     */
    public function store(ForgotPasswordUserRequest $request): JsonResponse
    {
        $status = Password::broker('users')->sendResetLink(
            $request->only('email')
        );

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [trans($status)],
            ]);
        }

        return response()->json(['message' => trans($status)]);
    }
}
