<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Concerns\ThrottlesLogins;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginCompanyRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class CompanyAuthenticatedSessionController extends Controller
{
    use ThrottlesLogins;

    /**
     * 企業のログイン
     */
    public function store(LoginCompanyRequest $request): JsonResponse
    {
        $this->ensureIsNotRateLimited($request, 'company');

        if (! Auth::guard('company')->attempt($request->validated())) {
            $this->hitRateLimiter($request, 'company');

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $this->clearRateLimiter($request, 'company');

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
