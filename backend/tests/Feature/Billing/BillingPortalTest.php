<?php

use App\Models\Company;

/**
 * checkoutと同様、実際にStripe(テストモード)のAPIへリクエストを送り、
 * 正規のカスタマーポータルURLが返ってくることを確認する(モックしない)
 */
it('creates a stripe billing portal session for a company with a stripe customer', function () {
    $company = Company::factory()->create();
    $company->createOrGetStripeCustomer();

    $response = $this->actingAs($company, 'company')->postJson('/api/company/billing/portal');

    $response->assertOk();
    expect($response->json('portal_url'))->toStartWith('https://billing.stripe.com/');
})->skip(fn () => blank(config('cashier.secret')), 'STRIPE_SECRETが未設定のためスキップ(CI環境などStripeテストキーを持たない環境向け)');

it('rejects requesting a portal session before any stripe customer has been created', function () {
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson('/api/company/billing/portal');

    $response->assertUnprocessable()->assertJsonValidationErrors('billing');
});

it('rejects unauthenticated requests', function () {
    $this->postJson('/api/company/billing/portal')->assertUnauthorized();
});
