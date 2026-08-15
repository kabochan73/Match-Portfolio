<?php

use App\Models\Company;
use Illuminate\Support\Str;
use Laravel\Cashier\Subscription;

/**
 * Stripe APIを叩かずローカルのsubscriptionsテーブルへ直接行を作ることで、
 * billingStatus()の分岐ロジックだけを検証する(実際のCheckout/Webhook経由の同期は別テストで扱う)
 */
function createSubscriptionFor(Company $company, string $stripeStatus): Subscription
{
    return Subscription::create([
        'company_id' => $company->id,
        'type' => 'default',
        'stripe_id' => 'sub_'.Str::random(14),
        'stripe_status' => $stripeStatus,
        'stripe_price' => config('services.stripe.job_posting_price_id'),
        'quantity' => 1,
    ]);
}

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
