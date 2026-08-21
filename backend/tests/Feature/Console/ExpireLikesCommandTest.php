<?php

use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;

it('expires applied likes whose response deadline has passed', function () {
    $like = Like::factory()->for(User::factory())->for(JobPosting::factory())->create([
        'status' => 'applied',
        'applied_at' => now()->subDays(8),
        'response_deadline' => now()->subDay(),
    ]);

    $this->artisan('likes:expire')->assertExitCode(0);

    expect($like->fresh()->status)->toBe('expired');
});

it('leaves applied likes untouched while the response deadline has not passed yet', function () {
    $like = Like::factory()->for(User::factory())->for(JobPosting::factory())->create([
        'status' => 'applied',
        'applied_at' => now(),
        'response_deadline' => now()->addDays(6),
    ]);

    $this->artisan('likes:expire')->assertExitCode(0);

    expect($like->fresh()->status)->toBe('applied');
});

it('does not touch already matched likes even past the response deadline', function () {
    $like = Like::factory()->for(User::factory())->for(JobPosting::factory())->create([
        'status' => 'matched',
        'applied_at' => now()->subDays(8),
        'response_deadline' => now()->subDay(),
        'company_responded_at' => now()->subDays(2),
    ]);

    $this->artisan('likes:expire')->assertExitCode(0);

    expect($like->fresh()->status)->toBe('matched');
});
