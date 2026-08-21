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

it('locks out login after too many failed attempts with the same email', function () {
    User::factory()->create(['email' => 'taro@example.com', 'password' => 'password123']);

    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/login', [
            'email' => 'taro@example.com',
            'password' => 'wrong-password',
        ])->assertUnprocessable();
    }

    // 6回目は資格情報が正しくてもロックアウトにより弾かれる
    $response = $this->postJson('/api/login', [
        'email' => 'taro@example.com',
        'password' => 'password123',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('email');
    expect(Auth::guard('web')->check())->toBeFalse();
});

it('does not lock out login attempts for a different email', function () {
    User::factory()->create(['email' => 'taro@example.com', 'password' => 'password123']);
    $other = User::factory()->create(['email' => 'jiro@example.com', 'password' => 'password123']);

    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/login', [
            'email' => 'taro@example.com',
            'password' => 'wrong-password',
        ])->assertUnprocessable();
    }

    $response = $this->postJson('/api/login', [
        'email' => 'jiro@example.com',
        'password' => 'password123',
    ]);

    $response->assertOk();
    expect(Auth::guard('web')->id())->toBe($other->id);
});

it('logs out an authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'web')->postJson('/api/logout');

    $response->assertNoContent();
    expect(Auth::guard('web')->check())->toBeFalse();
});
