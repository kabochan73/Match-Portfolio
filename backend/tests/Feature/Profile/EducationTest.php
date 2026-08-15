<?php

use App\Models\Education;
use App\Models\User;

it('lists only the authenticated user\'s own educations', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    Education::factory()->for($user)->create(['school_name' => '自分の大学']);
    Education::factory()->for($other)->create(['school_name' => '他人の大学']);

    $response = $this->actingAs($user, 'web')->getJson('/api/profile/educations');

    $response->assertOk();
    expect($response->json())->toHaveCount(1)
        ->and($response->json('0.school_name'))->toBe('自分の大学');
});

it('creates an education for the authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'web')->postJson('/api/profile/educations', [
        'school_name' => 'サンプル大学',
    ]);

    $response->assertCreated();
    expect($user->educations()->count())->toBe(1);
});

it('rejects a blank school_name', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'web')->postJson('/api/profile/educations', [
        'school_name' => '',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('school_name');
});

it('updates the authenticated user\'s own education', function () {
    $user = User::factory()->create();
    $education = Education::factory()->for($user)->create(['school_name' => '旧 大学']);

    $response = $this->actingAs($user, 'web')->putJson("/api/profile/educations/{$education->id}", [
        'school_name' => '新 大学',
    ]);

    $response->assertOk();
    expect($education->fresh()->school_name)->toBe('新 大学');
});

it('prevents updating another user\'s education', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $education = Education::factory()->for($other)->create();

    $response = $this->actingAs($user, 'web')->putJson("/api/profile/educations/{$education->id}", [
        'school_name' => '書き換え試行',
    ]);

    $response->assertNotFound();
});

it('deletes the authenticated user\'s own education', function () {
    $user = User::factory()->create();
    $education = Education::factory()->for($user)->create();

    $response = $this->actingAs($user, 'web')->deleteJson("/api/profile/educations/{$education->id}");

    $response->assertNoContent();
    expect(Education::find($education->id))->toBeNull();
});

it('prevents deleting another user\'s education', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $education = Education::factory()->for($other)->create();

    $response = $this->actingAs($user, 'web')->deleteJson("/api/profile/educations/{$education->id}");

    $response->assertNotFound();
    expect(Education::find($education->id))->not->toBeNull();
});

it('rejects unauthenticated requests', function () {
    $this->getJson('/api/profile/educations')->assertUnauthorized();
});
