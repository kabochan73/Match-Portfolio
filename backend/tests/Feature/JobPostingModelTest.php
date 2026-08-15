<?php

use App\Models\Company;
use App\Models\JobPosting;
use Illuminate\Database\QueryException;

it('creates a job posting belonging to a company', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();

    expect($jobPosting->company->is($company))->toBeTrue()
        ->and($company->jobPostings->pluck('id')->all())->toBe([$jobPosting->id]);
});

it('rejects an invalid status via the JobPostingStatus enum cast', function () {
    // statusはモデル側でbacked enumにキャストしているため、DBのCHECK制約に届く前にPHP側(ValueError)で弾かれる
    expect(fn () => JobPosting::factory()->create(['status' => 'invalid_status']))
        ->toThrow(ValueError::class);
});

it('rejects an invalid prefecture via the DB check constraint', function () {
    expect(fn () => JobPosting::factory()->create(['prefecture' => '存在しない県']))
        ->toThrow(QueryException::class);
});
