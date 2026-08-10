<?php

use App\Models\Company;

it('creates a company with a factory and persists it to the database', function () {
    $company = Company::factory()->create();

    $this->assertDatabaseHas('companies', [
        'id' => $company->id,
        'email' => $company->email,
    ]);
});

it('rejects an invalid member_count_range via the MemberCountRange enum cast', function () {
    // member_count_rangeはモデル側でbacked enumにキャストしているため、
    // DBのCHECK制約に届く前にPHP側(ValueError)で弾かれる
    expect(fn () => Company::factory()->create(['member_count_range' => 'invalid_range']))
        ->toThrow(ValueError::class);
});
