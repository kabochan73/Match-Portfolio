<?php

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

it('logs in with correct credentials', function () {
    $company = Company::factory()->create(['email' => 'company@example.com', 'password' => 'password123']);

    $response = $this->postJson('/api/company/login', [
        'email' => 'company@example.com',
        'password' => 'password123',
    ]);

    $response->assertOk();
    expect(Auth::guard('company')->id())->toBe($company->id);
});

it('rejects login with an incorrect password', function () {
    Company::factory()->create(['email' => 'company@example.com', 'password' => 'password123']);

    $response = $this->postJson('/api/company/login', [
        'email' => 'company@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('email');
    expect(Auth::guard('company')->check())->toBeFalse();
});

it('logs out an authenticated company', function () {
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson('/api/company/logout');

    $response->assertNoContent();
    expect(Auth::guard('company')->check())->toBeFalse();
});

it('keeps the user and company guards independent of each other', function () {
    $user = User::factory()->create();
    $company = Company::factory()->create();

    $this->actingAs($user, 'web')->actingAs($company, 'company');

    expect(Auth::guard('web')->id())->toBe($user->id)
        ->and(Auth::guard('company')->id())->toBe($company->id);
});
