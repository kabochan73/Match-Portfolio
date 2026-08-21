<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Concerns\ThrottlesLogins;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginUserRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    use ThrottlesLogins;

    /**
     * 求職者のログイン
     */
    public function store(LoginUserRequest $request): JsonResponse
    {
        $this->ensureIsNotRateLimited($request, 'web');

        if (! Auth::guard('web')->attempt($request->validated())) {
            $this->hitRateLimiter($request, 'web');

            // 「メールアドレスが未登録」なのか「パスワードが違う」なのかは区別せず返す(アカウントの存在を推測されないようにするため)
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $this->clearRateLimiter($request, 'web');

        $request->session()->regenerate();

        return response()->json(Auth::guard('web')->user());
    }

    /**
     * 求職者のログアウト
     */
    public function destroy(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(null, 204);
    }
}
