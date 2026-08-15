<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ResetPasswordCompanyRequest;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class CompanyNewPasswordController extends Controller
{
    /**
     * 企業のパスワードをリセットする。トークンの検証も含めPassword::reset()に任せる
     */
    public function store(ResetPasswordCompanyRequest $request): JsonResponse
    {
        $status = Password::broker('companies')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (Company $company, string $password) {
                $company->password = Hash::make($password);
                $company->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [trans($status)],
            ]);
        }

        return response()->json(['message' => trans($status)]);
    }
}
