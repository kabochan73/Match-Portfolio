<?php

use App\Models\Company;
use Illuminate\Support\Facades\Auth;

it('registers a new company with only the required fields and logs it in', function () {
    $response = $this->postJson('/api/company/register', [
        'name' => 'テスト株式会社',
        'email' => 'company@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('companies', ['email' => 'company@example.com']);
    expect(Auth::guard('company')->check())->toBeTrue();
});

it('registers a new company with all optional profile fields', function () {
    $response = $this->postJson('/api/company/register', [
        'name' => 'テスト株式会社',
        'email' => 'company2@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'description' => 'テストの会社です',
        'phone_number' => '03-1234-5678',
        'prefecture' => '東京都',
        'address_line' => '千代田区1-1-1',
        'founded_year' => 2020,
        'member_count_range' => '11_50',
        'website_url' => 'https://example.com',
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('companies', [
        'email' => 'company2@example.com',
        'prefecture' => '東京都',
        'member_count_range' => '11_50',
    ]);
});

it('rejects registration with an invalid prefecture', function () {
    $response = $this->postJson('/api/company/register', [
        'name' => 'テスト株式会社',
        'email' => 'company3@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'prefecture' => '存在しない県',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('prefecture');
});

it('rejects registration with a duplicate email', function () {
    Company::factory()->create(['email' => 'taken@example.com']);

    $response = $this->postJson('/api/company/register', [
        'name' => 'テスト株式会社',
        'email' => 'taken@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('email');
});
