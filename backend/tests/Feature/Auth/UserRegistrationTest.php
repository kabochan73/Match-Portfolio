<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;

it('registers a new user and logs them in', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'テスト太郎',
        'email' => 'taro@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'birth_date' => now()->subYears(25)->toDateString(),
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('users', ['email' => 'taro@example.com']);
    expect(Auth::guard('web')->check())->toBeTrue();
});

it('rejects registration when younger than 18', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'テスト花子',
        'email' => 'hanako@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'birth_date' => now()->subYears(17)->toDateString(),
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('birth_date');
});

it('rejects registration with a duplicate email', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $response = $this->postJson('/api/register', [
        'name' => 'テスト次郎',
        'email' => 'taken@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'birth_date' => now()->subYears(25)->toDateString(),
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('email');
});
