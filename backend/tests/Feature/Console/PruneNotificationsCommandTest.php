<?php

use App\Models\Company;
use App\Models\Like;
use App\Models\User;
use App\Notifications\LikeMatched;
use App\Notifications\NewApplication;

it('deletes notifications created more than a month ago', function () {
    $user = User::factory()->create();
    $like = Like::factory()->for($user)->create();
    $user->notify(new LikeMatched($like));
    $user->notifications()->first()->update(['created_at' => now()->subMonth()->subDay()]);

    $this->artisan('notifications:prune')->assertExitCode(0);

    expect($user->notifications()->count())->toBe(0);
});

it('keeps notifications created within the last month', function () {
    $user = User::factory()->create();
    $like = Like::factory()->for($user)->create();
    $user->notify(new LikeMatched($like));
    $user->notifications()->first()->update(['created_at' => now()->subDays(29)]);

    $this->artisan('notifications:prune')->assertExitCode(0);

    expect($user->notifications()->count())->toBe(1);
});

it('prunes old notifications for companies too, since they share the same table', function () {
    $company = Company::factory()->create();
    $like = Like::factory()->create();
    $company->notify(new NewApplication($like));
    $company->notifications()->first()->update(['created_at' => now()->subMonth()->subDay()]);

    $this->artisan('notifications:prune')->assertExitCode(0);

    expect($company->notifications()->count())->toBe(0);
});
