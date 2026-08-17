<?php

use App\Models\User;

it('returns the profile of the authenticated user', function () {
    $user = User::factory()->create(['name' => '表示 太郎']);

    $response = $this->actingAs($user, 'web')->getJson('/api/profile');

    $response->assertOk()->assertJsonFragment(['name' => '表示 太郎']);
});

it('rejects unauthenticated requests to view the profile', function () {
    $response = $this->getJson('/api/profile');

    $response->assertUnauthorized();
});

it('updates the profile of the authenticated user', function () {
    $user = User::factory()->create([
        'name' => '旧 太郎',
        'comment' => '旧コメント',
        'portfolio_url' => 'https://old.example.com',
        'birth_date' => '1990-01-01',
    ]);

    $response = $this->actingAs($user, 'web')->putJson('/api/profile', [
        'name' => '新 太郎',
        'comment' => '新しい自己紹介コメントです',
        'portfolio_url' => 'https://new.example.com',
        'birth_date' => '1992-05-10',
    ]);

    $response->assertOk();
    expect($user->fresh())
        ->name->toBe('新 太郎')
        ->comment->toBe('新しい自己紹介コメントです')
        ->portfolio_url->toBe('https://new.example.com')
        ->birth_date->toDateString()->toBe('1992-05-10');
});

it('allows clearing optional fields', function () {
    $user = User::factory()->create([
        'comment' => '旧コメント',
        'portfolio_url' => 'https://old.example.com',
    ]);

    $response = $this->actingAs($user, 'web')->putJson('/api/profile', [
        'name' => $user->name,
        'comment' => null,
        'portfolio_url' => null,
        'birth_date' => $user->birth_date->toDateString(),
    ]);

    $response->assertOk();
    expect($user->fresh())->comment->toBeNull()->portfolio_url->toBeNull();
});

it('rejects a birth date that makes the user younger than 18', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'web')->putJson('/api/profile', [
        'name' => $user->name,
        'birth_date' => now()->subYears(10)->toDateString(),
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('birth_date');
});

it('rejects unauthenticated requests', function () {
    $response = $this->putJson('/api/profile', ['name' => '太郎']);

    $response->assertUnauthorized();
});
