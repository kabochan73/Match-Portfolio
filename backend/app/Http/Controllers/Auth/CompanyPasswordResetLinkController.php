<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordCompanyRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class CompanyPasswordResetLinkController extends Controller
{
    /**
     * 企業向けのパスワードリセットリンクをメール送信する。
     * 存在しないメールアドレスかどうかはPassword::sendResetLink()のステータスとして区別される
     */
    public function store(ForgotPasswordCompanyRequest $request): JsonResponse
    {
        $status = Password::broker('companies')->sendResetLink(
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
