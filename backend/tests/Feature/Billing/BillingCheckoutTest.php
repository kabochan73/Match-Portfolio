<?php

use App\Models\Company;

/**
 * 実際にStripe(テストモード)のAPIへリクエストを送り、正規のCheckout Session URLが
 * 返ってくることを確認する(ここだけはStripe APIとの結線そのものを検証したいため、モックしない)
 */
it('creates a stripe checkout session for an uncontracted company', function () {
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson('/api/company/billing/checkout');

    $response->assertOk();
    expect($response->json('checkout_url'))->toStartWith('https://checkout.stripe.com/');
})->skip(fn () => blank(config('cashier.secret')), 'STRIPE_SECRETが未設定のためスキップ(CI環境などStripeテストキーを持たない環境向け)');

it('rejects starting checkout when already actively subscribed', function () {
    $company = Company::factory()->create();
    createSubscriptionFor($company, 'active');

    $response = $this->actingAs($company, 'company')->postJson('/api/company/billing/checkout');

    $response->assertUnprocessable()->assertJsonValidationErrors('billing');
});

it('rejects unauthenticated requests', function () {
    $this->postJson('/api/company/billing/checkout')->assertUnauthorized();
});
