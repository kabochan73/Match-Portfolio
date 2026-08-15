<?php

use App\Models\User;
use App\Models\WorkExperience;

it('lists only the authenticated user\'s own work experiences', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    WorkExperience::factory()->for($user)->create(['company_name' => '自分の会社']);
    WorkExperience::factory()->for($other)->create(['company_name' => '他人の会社']);

    $response = $this->actingAs($user, 'web')->getJson('/api/profile/work-experiences');

    $response->assertOk();
    expect($response->json())->toHaveCount(1)
        ->and($response->json('0.company_name'))->toBe('自分の会社');
});

it('creates a work experience for the authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'web')->postJson('/api/profile/work-experiences', [
        'company_name' => '株式会社サンプル',
        'started_on' => '2020-04-01',
        'ended_on' => null,
        'employment_type' => 'full_time',
    ]);

    $response->assertCreated();
    expect($user->workExperiences()->count())->toBe(1);
});

it('rejects an ended_on date earlier than started_on', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'web')->postJson('/api/profile/work-experiences', [
        'company_name' => '株式会社サンプル',
        'started_on' => '2020-04-01',
        'ended_on' => '2019-04-01',
        'employment_type' => 'full_time',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('ended_on');
});

it('rejects an invalid employment_type', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'web')->postJson('/api/profile/work-experiences', [
        'company_name' => '株式会社サンプル',
        'started_on' => '2020-04-01',
        'employment_type' => 'invalid',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('employment_type');
});

it('updates the authenticated user\'s own work experience', function () {
    $user = User::factory()->create();
    $workExperience = WorkExperience::factory()->for($user)->create(['company_name' => '旧 会社名']);

    $response = $this->actingAs($user, 'web')->putJson("/api/profile/work-experiences/{$workExperience->id}", [
        'company_name' => '新 会社名',
        'started_on' => $workExperience->started_on->toDateString(),
        'ended_on' => null,
        'employment_type' => 'contract',
    ]);

    $response->assertOk();
    expect($workExperience->fresh()->company_name)->toBe('新 会社名');
});

it('prevents updating another user\'s work experience', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $workExperience = WorkExperience::factory()->for($other)->create();

    $response = $this->actingAs($user, 'web')->putJson("/api/profile/work-experiences/{$workExperience->id}", [
        'company_name' => '書き換え試行',
        'started_on' => '2020-04-01',
        'employment_type' => 'full_time',
    ]);

    $response->assertNotFound();
});

it('deletes the authenticated user\'s own work experience', function () {
    $user = User::factory()->create();
    $workExperience = WorkExperience::factory()->for($user)->create();

    $response = $this->actingAs($user, 'web')->deleteJson("/api/profile/work-experiences/{$workExperience->id}");

    $response->assertNoContent();
    expect(WorkExperience::find($workExperience->id))->toBeNull();
});

it('prevents deleting another user\'s work experience', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $workExperience = WorkExperience::factory()->for($other)->create();

    $response = $this->actingAs($user, 'web')->deleteJson("/api/profile/work-experiences/{$workExperience->id}");

    $response->assertNotFound();
    expect(WorkExperience::find($workExperience->id))->not->toBeNull();
});

it('rejects unauthenticated requests', function () {
    $this->getJson('/api/profile/work-experiences')->assertUnauthorized();
});
