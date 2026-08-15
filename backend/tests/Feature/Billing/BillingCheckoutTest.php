<?php

use App\Models\Company;
use Illuminate\Support\Str;
use Laravel\Cashier\Subscription;

/**
 * 実際にStripe(テストモード)のAPIへリクエストを送り、正規のCheckout Session URLが
 * 返ってくることを確認する(ここだけはStripe APIとの結線そのものを検証したいため、モックしない)
 */
it('creates a stripe checkout session for an uncontracted company', function () {
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson('/api/company/billing/checkout');

    $response->assertOk();
    expect($response->json('checkout_url'))->toStartWith('https://checkout.stripe.com/');
});

it('rejects starting checkout when already actively subscribed', function () {
    $company = Company::factory()->create();
    Subscription::create([
        'company_id' => $company->id,
        'type' => 'default',
        'stripe_id' => 'sub_'.Str::random(14),
        'stripe_status' => 'active',
        'stripe_price' => config('services.stripe.job_posting_price_id'),
        'quantity' => 1,
    ]);

    $response = $this->actingAs($company, 'company')->postJson('/api/company/billing/checkout');

    $response->assertUnprocessable()->assertJsonValidationErrors('billing');
});

it('rejects unauthenticated requests', function () {
    $this->postJson('/api/company/billing/checkout')->assertUnauthorized();
});
