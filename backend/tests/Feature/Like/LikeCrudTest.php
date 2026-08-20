<?php

use App\Enums\JobPostingStatus;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;

function validLikePayload(array $overrides = []): array
{
    return array_merge([
        'job_posting_id' => JobPosting::factory()->create(['status' => JobPostingStatus::Published])->id,
        'like_type' => 'standard',
        'motivation' => '貴社の事業内容に強く共感したため志望しました。',
    ], $overrides);
}

it('creates a like (application) for a published job posting', function () {
    $user = User::factory()->create();
    $jobPosting = JobPosting::factory()->create(['status' => JobPostingStatus::Published]);

    $response = $this->actingAs($user, 'web')->postJson('/api/likes', validLikePayload(['job_posting_id' => $jobPosting->id]));

    $response->assertCreated();
    expect($response->json('status'))->toBe('applied')
        ->and($response->json('job_posting_id'))->toBe($jobPosting->id)
        ->and($response->json('applied_at'))->not->toBeNull()
        ->and($response->json('response_deadline'))->not->toBeNull();

    $like = Like::first();
    expect((int) $like->applied_at->diffInDays($like->response_deadline))->toBe(7);
});

it('rejects applying to a non-published job posting', function () {
    $user = User::factory()->create();
    $jobPosting = JobPosting::factory()->create(['status' => JobPostingStatus::Draft]);

    $response = $this->actingAs($user, 'web')->postJson('/api/likes', validLikePayload(['job_posting_id' => $jobPosting->id]));

    $response->assertUnprocessable()->assertJsonValidationErrors('job_posting_id');
});

it('rejects a duplicate application while the previous one is still pending', function () {
    $user = User::factory()->create();
    $jobPosting = JobPosting::factory()->create(['status' => JobPostingStatus::Published]);
    Like::factory()->for($user)->for($jobPosting)->create(['status' => 'applied']);

    $response = $this->actingAs($user, 'web')->postJson('/api/likes', validLikePayload(['job_posting_id' => $jobPosting->id]));

    $response->assertUnprocessable()->assertJsonValidationErrors('job_posting_id');
});

it('allows re-applying once the previous application has expired', function () {
    $user = User::factory()->create();
    $jobPosting = JobPosting::factory()->create(['status' => JobPostingStatus::Published]);
    Like::factory()->for($user)->for($jobPosting)->create(['status' => 'expired']);

    $response = $this->actingAs($user, 'web')->postJson('/api/likes', validLikePayload(['job_posting_id' => $jobPosting->id]));

    $response->assertCreated();
});

it('rejects a standard like once the monthly limit of 10 is reached', function () {
    $user = User::factory()->create();
    Like::factory()->count(10)->for($user)->create(['like_type' => 'standard', 'applied_at' => now()]);
    $jobPosting = JobPosting::factory()->create(['status' => JobPostingStatus::Published]);

    $response = $this->actingAs($user, 'web')->postJson('/api/likes', validLikePayload([
        'job_posting_id' => $jobPosting->id,
        'like_type' => 'standard',
    ]));

    $response->assertUnprocessable()->assertJsonValidationErrors('like_type');
});

it('rejects a super like once the monthly limit of 1 is reached', function () {
    $user = User::factory()->create();
    Like::factory()->for($user)->create(['like_type' => 'super', 'applied_at' => now()]);
    $jobPosting = JobPosting::factory()->create(['status' => JobPostingStatus::Published]);

    $response = $this->actingAs($user, 'web')->postJson('/api/likes', validLikePayload([
        'job_posting_id' => $jobPosting->id,
        'like_type' => 'super',
    ]));

    $response->assertUnprocessable()->assertJsonValidationErrors('like_type');
});

it('tracks standard and super monthly limits independently', function () {
    $user = User::factory()->create();
    Like::factory()->count(10)->for($user)->create(['like_type' => 'standard', 'applied_at' => now()]);
    $jobPosting = JobPosting::factory()->create(['status' => JobPostingStatus::Published]);

    $response = $this->actingAs($user, 'web')->postJson('/api/likes', validLikePayload([
        'job_posting_id' => $jobPosting->id,
        'like_type' => 'super',
    ]));

    $response->assertCreated();
});

it('does not count last month\'s likes toward this month\'s limit', function () {
    $user = User::factory()->create();
    Like::factory()->count(10)->for($user)->create(['like_type' => 'standard', 'applied_at' => now()->subMonth()]);
    $jobPosting = JobPosting::factory()->create(['status' => JobPostingStatus::Published]);

    $response = $this->actingAs($user, 'web')->postJson('/api/likes', validLikePayload([
        'job_posting_id' => $jobPosting->id,
        'like_type' => 'standard',
    ]));

    $response->assertCreated();
});

it('rejects a request without a motivation', function () {
    $user = User::factory()->create();
    $jobPosting = JobPosting::factory()->create(['status' => JobPostingStatus::Published]);

    $response = $this->actingAs($user, 'web')->postJson('/api/likes', validLikePayload([
        'job_posting_id' => $jobPosting->id,
        'motivation' => '',
    ]));

    $response->assertUnprocessable()->assertJsonValidationErrors('motivation');
});

it('rejects an invalid like_type', function () {
    $user = User::factory()->create();
    $jobPosting = JobPosting::factory()->create(['status' => JobPostingStatus::Published]);

    $response = $this->actingAs($user, 'web')->postJson('/api/likes', validLikePayload([
        'job_posting_id' => $jobPosting->id,
        'like_type' => 'invalid',
    ]));

    $response->assertUnprocessable()->assertJsonValidationErrors('like_type');
});

it('rejects unauthenticated requests to create a like', function () {
    $this->postJson('/api/likes', validLikePayload())->assertUnauthorized();
});

it('lists only the authenticated user\'s own likes, newest first', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $older = Like::factory()->for($user)->create(['applied_at' => now()->subDays(2)]);
    $newer = Like::factory()->for($user)->create(['applied_at' => now()->subDay()]);
    Like::factory()->for($other)->create();

    $response = $this->actingAs($user, 'web')->getJson('/api/likes');

    $response->assertOk();
    expect($response->json('*.id'))->toBe([$newer->id, $older->id]);
});

it('rejects unauthenticated requests to list likes', function () {
    $this->getJson('/api/likes')->assertUnauthorized();
});

it('returns the remaining monthly like counts for the authenticated user', function () {
    $user = User::factory()->create();
    Like::factory()->count(3)->for($user)->create(['like_type' => 'standard', 'applied_at' => now()]);
    Like::factory()->for($user)->create(['like_type' => 'super', 'applied_at' => now()]);

    $response = $this->actingAs($user, 'web')->getJson('/api/likes/remaining');

    $response->assertOk();
    expect($response->json('standard'))->toBe(['limit' => 10, 'used' => 3, 'remaining' => 7])
        ->and($response->json('super'))->toBe(['limit' => 1, 'used' => 1, 'remaining' => 0]);
});

it('does not count last month\'s likes toward the remaining count', function () {
    $user = User::factory()->create();
    Like::factory()->count(5)->for($user)->create(['like_type' => 'standard', 'applied_at' => now()->subMonth()]);

    $response = $this->actingAs($user, 'web')->getJson('/api/likes/remaining');

    $response->assertOk();
    expect($response->json('standard'))->toBe(['limit' => 10, 'used' => 0, 'remaining' => 10]);
});

it('does not count another user\'s likes toward the remaining count', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    Like::factory()->count(5)->for($other)->create(['like_type' => 'standard', 'applied_at' => now()]);

    $response = $this->actingAs($user, 'web')->getJson('/api/likes/remaining');

    $response->assertOk();
    expect($response->json('standard'))->toBe(['limit' => 10, 'used' => 0, 'remaining' => 10]);
});

it('rejects unauthenticated requests to fetch the remaining like counts', function () {
    $this->getJson('/api/likes/remaining')->assertUnauthorized();
});
