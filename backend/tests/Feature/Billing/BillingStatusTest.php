<?php

use App\Models\Company;

it('reports uncontracted when the company has no subscription', function () {
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->getJson('/api/company/billing/status');

    $response->assertOk()->assertJson(['status' => 'uncontracted']);
});

it('reports active when the subscription is active', function () {
    $company = Company::factory()->create();
    createSubscriptionFor($company, 'active');

    $response = $this->actingAs($company, 'company')->getJson('/api/company/billing/status');

    $response->assertOk()->assertJson(['status' => 'active']);
});

it('reports unpaid when the subscription is past_due', function () {
    $company = Company::factory()->create();
    createSubscriptionFor($company, 'past_due');

    $response = $this->actingAs($company, 'company')->getJson('/api/company/billing/status');

    $response->assertOk()->assertJson(['status' => 'unpaid']);
});

it('reports unpaid when the subscription is unpaid', function () {
    $company = Company::factory()->create();
    createSubscriptionFor($company, 'unpaid');

    $response = $this->actingAs($company, 'company')->getJson('/api/company/billing/status');

    $response->assertOk()->assertJson(['status' => 'unpaid']);
});

it('rejects unauthenticated requests', function () {
    $this->getJson('/api/company/billing/status')->assertUnauthorized();
});
