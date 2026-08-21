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

it('reports uncontracted when the previous subscription has fully ended (canceled, grace period over)', function () {
    $company = Company::factory()->create();
    $subscription = createSubscriptionFor($company, 'canceled');
    $subscription->update(['ends_at' => now()->subDay()]);

    $response = $this->actingAs($company, 'company')->getJson('/api/company/billing/status');

    $response->assertOk()->assertJson(['status' => 'uncontracted']);
});

it('reports active (not uncontracted) while a canceled subscription is still on its grace period', function () {
    // Cashierの仕様上、解約済みでも猶予期間(ends_at未到達)の間はactive()がtrueを返す
    // (期間終了まで引き続き利用できる、という一般的なサブスクリプション解約の挙動に合わせるため)
    $company = Company::factory()->create();
    $subscription = createSubscriptionFor($company, 'canceled');
    $subscription->update(['ends_at' => now()->addDays(3)]);

    $response = $this->actingAs($company, 'company')->getJson('/api/company/billing/status');

    $response->assertOk()->assertJson(['status' => 'active']);
});

it('rejects unauthenticated requests', function () {
    $this->getJson('/api/company/billing/status')->assertUnauthorized();
});
