<?php

use App\Models\Certification;
use App\Models\User;

it('lists only the authenticated user\'s own certifications', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    Certification::factory()->for($user)->create(['name' => '自分の資格']);
    Certification::factory()->for($other)->create(['name' => '他人の資格']);

    $response = $this->actingAs($user, 'web')->getJson('/api/profile/certifications');

    $response->assertOk();
    expect($response->json())->toHaveCount(1)
        ->and($response->json('0.name'))->toBe('自分の資格');
});

it('creates a certification for the authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'web')->postJson('/api/profile/certifications', [
        'name' => '基本情報技術者試験',
    ]);

    $response->assertCreated();
    expect($user->certifications()->count())->toBe(1);
});

it('rejects a duplicate certification name for the same user', function () {
    $user = User::factory()->create();
    Certification::factory()->for($user)->create(['name' => '基本情報技術者試験']);

    $response = $this->actingAs($user, 'web')->postJson('/api/profile/certifications', [
        'name' => '基本情報技術者試験',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('name');
});

it('allows different users to register the same certification name', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    Certification::factory()->for($other)->create(['name' => '基本情報技術者試験']);

    $response = $this->actingAs($user, 'web')->postJson('/api/profile/certifications', [
        'name' => '基本情報技術者試験',
    ]);

    $response->assertCreated();
});

it('allows renaming a certification to its own current name', function () {
    $user = User::factory()->create();
    $certification = Certification::factory()->for($user)->create(['name' => '基本情報技術者試験']);

    $response = $this->actingAs($user, 'web')->putJson("/api/profile/certifications/{$certification->id}", [
        'name' => '基本情報技術者試験',
    ]);

    $response->assertOk();
});

it('updates the authenticated user\'s own certification', function () {
    $user = User::factory()->create();
    $certification = Certification::factory()->for($user)->create(['name' => '旧資格']);

    $response = $this->actingAs($user, 'web')->putJson("/api/profile/certifications/{$certification->id}", [
        'name' => '新資格',
    ]);

    $response->assertOk();
    expect($certification->fresh()->name)->toBe('新資格');
});

it('prevents updating another user\'s certification', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $certification = Certification::factory()->for($other)->create();

    $response = $this->actingAs($user, 'web')->putJson("/api/profile/certifications/{$certification->id}", [
        'name' => '書き換え試行',
    ]);

    $response->assertNotFound();
});

it('deletes the authenticated user\'s own certification', function () {
    $user = User::factory()->create();
    $certification = Certification::factory()->for($user)->create();

    $response = $this->actingAs($user, 'web')->deleteJson("/api/profile/certifications/{$certification->id}");

    $response->assertNoContent();
    expect(Certification::find($certification->id))->toBeNull();
});

it('prevents deleting another user\'s certification', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $certification = Certification::factory()->for($other)->create();

    $response = $this->actingAs($user, 'web')->deleteJson("/api/profile/certifications/{$certification->id}");

    $response->assertNotFound();
    expect(Certification::find($certification->id))->not->toBeNull();
});

it('rejects unauthenticated requests', function () {
    $this->getJson('/api/profile/certifications')->assertUnauthorized();
});
