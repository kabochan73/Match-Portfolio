<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

it('sends a password reset link to a registered email', function () {
    Notification::fake();

    $user = User::factory()->create(['email' => 'taro@example.com']);

    $response = $this->postJson('/api/forgot-password', ['email' => 'taro@example.com']);

    $response->assertOk();
    // リンク先がバックエンドではなくフロントエンド(Next.js)のリセット画面を指していることを確認する
    Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
        $mailMessage = $notification->toMail($user);

        return str_starts_with($mailMessage->actionUrl, config('app.frontend_url').'/seeker/reset-password?token=');
    });
});

it('rejects a password reset link request for an unregistered email', function () {
    Notification::fake();

    $response = $this->postJson('/api/forgot-password', ['email' => 'unknown@example.com']);

    $response->assertUnprocessable()->assertJsonValidationErrors('email');
    Notification::assertNothingSent();
});

it('resets the password with a valid token', function () {
    $user = User::factory()->create(['password' => 'old-password']);
    $token = passwordBroker('users')->createToken($user);

    $response = $this->postJson('/api/reset-password', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'new-password123',
        'password_confirmation' => 'new-password123',
    ]);

    $response->assertOk();
    expect(Hash::check('new-password123', $user->fresh()->password))->toBeTrue();
});

it('rejects resetting the password with an invalid token', function () {
    $user = User::factory()->create(['password' => 'old-password']);

    $response = $this->postJson('/api/reset-password', [
        'token' => 'invalid-token',
        'email' => $user->email,
        'password' => 'new-password123',
        'password_confirmation' => 'new-password123',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('email');
    expect(Hash::check('old-password', $user->fresh()->password))->toBeTrue();
});
