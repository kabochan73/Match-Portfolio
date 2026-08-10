<?php

use App\Models\Company;
use App\Models\Payment;
use Illuminate\Database\QueryException;

it('creates a payment belonging to a company', function () {
    $company = Company::factory()->create();
    $payment = Payment::factory()->for($company)->create();

    expect($payment->company->is($company))->toBeTrue()
        ->and($company->payments->pluck('id')->all())->toBe([$payment->id]);
});

it('rejects an invalid status via the DB check constraint', function () {
    expect(fn () => Payment::factory()->create(['status' => 'invalid_status']))
        ->toThrow(QueryException::class);
});

it('rejects a duplicate stripe_invoice_id', function () {
    Payment::factory()->create(['stripe_invoice_id' => 'in_duplicate']);

    expect(fn () => Payment::factory()->create(['stripe_invoice_id' => 'in_duplicate']))
        ->toThrow(QueryException::class);
});
