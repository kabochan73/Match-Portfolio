<?php

use App\Models\Company;
use Illuminate\Database\QueryException;

it('creates a company with a factory and persists it to the database', function () {
    $company = Company::factory()->create();

    $this->assertDatabaseHas('companies', [
        'id' => $company->id,
        'email' => $company->email,
    ]);
});

it('rejects an invalid member_count_range via the DB check constraint', function () {
    expect(fn () => Company::factory()->create(['member_count_range' => 'invalid_range']))
        ->toThrow(QueryException::class);
});
