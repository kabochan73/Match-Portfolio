<?php

use App\Models\Company;
use App\Models\Payment;

it('lists only the authenticated company\'s own payments, newest first', function () {
    $company = Company::factory()->create();
    $other = Company::factory()->create();

    $older = Payment::factory()->for($company)->create(['created_at' => now()->subDays(2)]);
    $newer = Payment::factory()->for($company)->create(['created_at' => now()->subDay()]);
    Payment::factory()->for($other)->create();

    $response = $this->actingAs($company, 'company')->getJson('/api/company/billing/payments');

    $response->assertOk();
    expect($response->json())->toHaveCount(2)
        ->and($response->json('0.id'))->toBe($newer->id)
        ->and($response->json('1.id'))->toBe($older->id);
});

it('rejects unauthenticated requests', function () {
    $this->getJson('/api/company/billing/payments')->assertUnauthorized();
});
