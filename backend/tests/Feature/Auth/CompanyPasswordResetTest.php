<?php

use App\Models\Company;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

it('sends a password reset link to a registered email', function () {
    Notification::fake();

    $company = Company::factory()->create(['email' => 'company@example.com']);

    $response = $this->postJson('/api/company/forgot-password', ['email' => 'company@example.com']);

    $response->assertOk();
    // リンク先がバックエンドではなくフロントエンド(Next.js)の企業用リセット画面を指していることを確認する
    Notification::assertSentTo($company, ResetPassword::class, function (ResetPassword $notification) use ($company) {
        $mailMessage = $notification->toMail($company);

        return str_starts_with($mailMessage->actionUrl, config('app.frontend_url').'/company/reset-password?token=');
    });
});

it('rejects a password reset link request for an unregistered email', function () {
    Notification::fake();

    $response = $this->postJson('/api/company/forgot-password', ['email' => 'unknown@example.com']);

    $response->assertUnprocessable()->assertJsonValidationErrors('email');
    Notification::assertNothingSent();
});

it('resets the password with a valid token', function () {
    $company = Company::factory()->create(['password' => 'old-password']);
    $token = passwordBroker('companies')->createToken($company);

    $response = $this->postJson('/api/company/reset-password', [
        'token' => $token,
        'email' => $company->email,
        'password' => 'new-password123',
        'password_confirmation' => 'new-password123',
    ]);

    $response->assertOk();
    expect(Hash::check('new-password123', $company->fresh()->password))->toBeTrue();
});

it('rejects resetting the password with an invalid token', function () {
    $company = Company::factory()->create(['password' => 'old-password']);

    $response = $this->postJson('/api/company/reset-password', [
        'token' => 'invalid-token',
        'email' => $company->email,
        'password' => 'new-password123',
        'password_confirmation' => 'new-password123',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('email');
    expect(Hash::check('old-password', $company->fresh()->password))->toBeTrue();
});

it('keeps the user and company password reset tokens independent of each other', function () {
    $company = Company::factory()->create(['email' => 'shared@example.com', 'password' => 'old-password']);
    $userToken = passwordBroker('users')->createToken(
        User::factory()->create(['email' => 'shared@example.com'])
    );

    // usersブローカーで発行されたトークンはcompaniesブローカーでは通らない(別テーブルで管理されているため)
    $response = $this->postJson('/api/company/reset-password', [
        'token' => $userToken,
        'email' => 'shared@example.com',
        'password' => 'new-password123',
        'password_confirmation' => 'new-password123',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('email');
    expect(Hash::check('old-password', $company->fresh()->password))->toBeTrue();
});
