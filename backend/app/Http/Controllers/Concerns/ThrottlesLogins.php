<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * 求職者/企業のログイン試行回数制限。メールアドレス(小文字化)+IPアドレスをキーにし、
 * 同一メールアドレスへの総当たり攻撃とIP単位の連続試行の両方を1回のカウントで防ぐ。
 * users/companiesはテーブルが別のため、同じメールアドレスが両方に存在してもキーが
 * 衝突しないよう、キーの先頭にガード名を含める
 */
trait ThrottlesLogins
{
    private const MAX_ATTEMPTS = 5;

    /**
     * 試行回数が上限に達している場合、残り待機秒数を含むエラーを返す
     */
    private function ensureIsNotRateLimited(Request $request, string $guard): void
    {
        $key = $this->throttleKey($request, $guard);

        if (! RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS)) {
            return;
        }

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => RateLimiter::availableIn($key),
            ]),
        ]);
    }

    private function hitRateLimiter(Request $request, string $guard): void
    {
        RateLimiter::hit($this->throttleKey($request, $guard));
    }

    private function clearRateLimiter(Request $request, string $guard): void
    {
        RateLimiter::clear($this->throttleKey($request, $guard));
    }

    private function throttleKey(Request $request, string $guard): string
    {
        return Str::transliterate($guard.'|'.Str::lower((string) $request->input('email')).'|'.$request->ip());
    }
}
