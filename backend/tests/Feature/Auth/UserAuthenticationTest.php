<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;

it('logs in with correct credentials', function () {
    $user = User::factory()->create(['email' => 'taro@example.com', 'password' => 'password123']);

    $response = $this->postJson('/api/login', [
        'email' => 'taro@example.com',
        'password' => 'password123',
    ]);

    $response->assertOk();
    expect(Auth::guard('web')->id())->toBe($user->id);
});

it('rejects login with an incorrect password', function () {
    User::factory()->create(['email' => 'taro@example.com', 'password' => 'password123']);

    $response = $this->postJson('/api/login', [
        'email' => 'taro@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('email');
    expect(Auth::guard('web')->check())->toBeFalse();
});

it('logs out an authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'web')->postJson('/api/logout');

    $response->assertNoContent();
    expect(Auth::guard('web')->check())->toBeFalse();
});
