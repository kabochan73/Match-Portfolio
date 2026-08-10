<?php

use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;
use Illuminate\Database\QueryException;

it('creates a like belonging to a user and a job posting', function () {
    $user = User::factory()->create();
    $jobPosting = JobPosting::factory()->create();
    $like = Like::factory()->for($user)->for($jobPosting)->create();

    expect($like->user->is($user))->toBeTrue()
        ->and($like->jobPosting->is($jobPosting))->toBeTrue()
        ->and($user->likes->pluck('id')->all())->toBe([$like->id])
        ->and($jobPosting->likes->pluck('id')->all())->toBe([$like->id]);
});

it('rejects a duplicate application to the same job posting while the first is still pending', function () {
    $user = User::factory()->create();
    $jobPosting = JobPosting::factory()->create();
    Like::factory()->for($user)->for($jobPosting)->create(['status' => 'applied']);

    expect(fn () => Like::factory()->for($user)->for($jobPosting)->create(['status' => 'applied']))
        ->toThrow(QueryException::class);
});

it('allows re-applying to the same job posting once the previous like has expired', function () {
    $user = User::factory()->create();
    $jobPosting = JobPosting::factory()->create();
    Like::factory()->for($user)->for($jobPosting)->create(['status' => 'expired']);

    $reapplied = Like::factory()->for($user)->for($jobPosting)->create(['status' => 'applied']);

    expect($reapplied->exists)->toBeTrue();
});

it('rejects an invalid status via the DB check constraint', function () {
    expect(fn () => Like::factory()->create(['status' => 'invalid_status']))
        ->toThrow(QueryException::class);
});
