<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginCompanyRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class CompanyAuthenticatedSessionController extends Controller
{
    /**
     * 企業のログイン
     */
    public function store(LoginCompanyRequest $request): JsonResponse
    {
        if (! Auth::guard('company')->attempt($request->validated())) {
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        return response()->json(Auth::guard('company')->user());
    }

    /**
     * 企業のログアウト
     */
    public function destroy(Request $request): JsonResponse
    {
        Auth::guard('company')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(null, 204);
    }
}
