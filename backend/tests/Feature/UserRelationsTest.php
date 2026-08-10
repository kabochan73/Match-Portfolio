<?php

use App\Models\Certification;
use App\Models\Education;
use App\Models\User;
use App\Models\WorkExperience;
use Illuminate\Database\QueryException;

it('returns work experiences ordered by started_on descending', function () {
    $user = User::factory()->create();

    $older = WorkExperience::factory()->for($user)->create(['started_on' => '2018-04-01']);
    $newer = WorkExperience::factory()->for($user)->create(['started_on' => '2022-04-01']);

    expect($user->workExperiences->pluck('id')->all())->toBe([$newer->id, $older->id]);
});

it('loads educations and certifications for a user', function () {
    $user = User::factory()->create();
    Education::factory()->for($user)->create();
    Certification::factory()->for($user)->create();

    expect($user->educations)->toHaveCount(1)
        ->and($user->certifications)->toHaveCount(1);
});

it('prevents duplicate certification names for the same user', function () {
    $user = User::factory()->create();
    Certification::factory()->for($user)->create(['name' => '基本情報技術者試験']);

    expect(fn () => Certification::factory()->for($user)->create(['name' => '基本情報技術者試験']))
        ->toThrow(QueryException::class);
});
