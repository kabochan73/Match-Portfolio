<?php

use App\Enums\JobPostingStatus;
use App\Models\Company;
use App\Models\JobPosting;
use App\Models\Payment;

/**
 * .envのSTRIPE_WEBHOOK_SECRETが空の間は署名検証がスキップされる(StripeWebhookController参照)ため、
 * ここでは署名なしの生JSONペイロードを直接POSTしてハンドラのロジックだけを検証する
 */
function invoicePayload(string $type, Company $company, array $overrides = []): array
{
    return [
        'type' => $type,
        'data' => [
            'object' => array_merge([
                'id' => 'in_'.uniqid(),
                'customer' => $company->stripe_id,
                'amount_paid' => 1000,
                'amount_due' => 1000,
                'status_transitions' => ['paid_at' => null],
                'parent' => ['subscription_details' => ['subscription' => null]],
            ], $overrides),
        ],
    ];
}

it('records a paid payment on invoice.payment_succeeded', function () {
    $company = Company::factory()->create(['stripe_id' => 'cus_test123']);

    $response = $this->postJson('/api/stripe/webhook', invoicePayload('invoice.payment_succeeded', $company, [
        'id' => 'in_success1',
        'status_transitions' => ['paid_at' => now()->timestamp],
    ]));

    $response->assertOk();
    $this->assertDatabaseHas('payments', [
        'company_id' => $company->id,
        'stripe_invoice_id' => 'in_success1',
        'amount' => 1000,
        'status' => 'paid',
    ]);
    expect(Payment::where('stripe_invoice_id', 'in_success1')->first()->paid_at)->not->toBeNull();
});

it('records a failed payment and unpublishes published job postings on invoice.payment_failed', function () {
    $company = Company::factory()->create(['stripe_id' => 'cus_test456']);
    $published = JobPosting::factory()->for($company)->create(['status' => 'published']);
    $draft = JobPosting::factory()->for($company)->create(['status' => 'draft']);
    $closed = JobPosting::factory()->for($company)->create(['status' => 'closed']);

    $response = $this->postJson('/api/stripe/webhook', invoicePayload('invoice.payment_failed', $company, [
        'id' => 'in_failed1',
        'amount_paid' => 0,
        'amount_due' => 1000,
    ]));

    $response->assertOk();
    $this->assertDatabaseHas('payments', [
        'company_id' => $company->id,
        'stripe_invoice_id' => 'in_failed1',
        'amount' => 1000,
        'status' => 'failed',
    ]);
    expect($published->fresh()->status)->toBe(JobPostingStatus::Unpublished)
        ->and($draft->fresh()->status)->toBe(JobPostingStatus::Draft)
        ->and($closed->fresh()->status)->toBe(JobPostingStatus::Closed);
});

it('does not unpublish job postings belonging to a different company', function () {
    $company = Company::factory()->create(['stripe_id' => 'cus_test789']);
    $other = Company::factory()->create(['stripe_id' => 'cus_other']);
    $otherPublished = JobPosting::factory()->for($other)->create(['status' => 'published']);

    $this->postJson('/api/stripe/webhook', invoicePayload('invoice.payment_failed', $company, ['id' => 'in_failed2']));

    expect($otherPublished->fresh()->status)->toBe(JobPostingStatus::Published);
});

it('ignores webhook events for an unknown stripe customer', function () {
    $response = $this->postJson('/api/stripe/webhook', [
        'type' => 'invoice.payment_failed',
        'data' => ['object' => [
            'id' => 'in_unknown',
            'customer' => 'cus_does_not_exist',
            'amount_paid' => 0,
            'amount_due' => 1000,
            'status_transitions' => ['paid_at' => null],
        ]],
    ]);

    $response->assertOk();
    $this->assertDatabaseMissing('payments', ['stripe_invoice_id' => 'in_unknown']);
});
