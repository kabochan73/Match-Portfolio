<?php

namespace App\Http\Controllers;

use App\Enums\JobPostingStatus;
use App\Models\Company;
use App\Models\Payment;
use Illuminate\Support\Carbon;
use Laravel\Cashier\Http\Controllers\WebhookController as CashierWebhookController;
use Symfony\Component\HttpFoundation\Response;

/**
 * サブスクリプション自体の状態同期(active/past_due/unpaid等)はCashier標準の
 * customer.subscription.updated処理に任せる(Company::billingStatus()はそこで更新される
 * subscriptions.stripe_statusから都度導出している)。ここで扱うのは、Cashierが面倒を見ない
 * このアプリ独自の要件のみ: paymentsテーブル(請求履歴キャッシュ)への同期と、決済失敗時の求人自動非公開
 */
class StripeWebhookController extends CashierWebhookController
{
    /**
     * 請求成功。paymentsに同期した上で、Cashier標準の処理(on-session checkoutのメタデータ更新)も実行する
     *
     * @param  array<string, mixed>  $payload
     */
    protected function handleInvoicePaymentSucceeded(array $payload): Response
    {
        $this->syncPayment($payload, 'paid');

        return parent::handleInvoicePaymentSucceeded($payload);
    }

    /**
     * 請求失敗。paymentsに同期した上で、この企業が公開中の求人をすべて自動非公開にする(REQUIREMENTS.md 4.4)。
     * データは保持されるため、支払い方法を更新した後は企業自身がpublishエンドポイントで再公開できる
     *
     * @param  array<string, mixed>  $payload
     */
    protected function handleInvoicePaymentFailed(array $payload): Response
    {
        $this->syncPayment($payload, 'failed');

        if ($company = $this->findCompanyByStripeId($payload['data']['object']['customer'])) {
            $company->jobPostings()
                ->where('status', JobPostingStatus::Published)
                ->update(['status' => JobPostingStatus::Unpublished]);
        }

        return $this->successMethod();
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function syncPayment(array $payload, string $status): void
    {
        $invoice = $payload['data']['object'];

        if (! $company = $this->findCompanyByStripeId($invoice['customer'])) {
            return;
        }

        Payment::updateOrCreate(
            ['stripe_invoice_id' => $invoice['id']],
            [
                'company_id' => $company->id,
                // JPYはゼロdecimal通貨のため、Stripeの金額(最小単位)がそのまま円単位になる(/100不要)
                'amount' => $invoice['amount_paid'] ?: $invoice['amount_due'],
                'status' => $status,
                'paid_at' => ! empty($invoice['status_transitions']['paid_at'])
                    ? Carbon::createFromTimestamp($invoice['status_transitions']['paid_at'])
                    : null,
            ]
        );
    }

    /**
     * 親クラスのgetUserByStripeId()の戻り値の型はBillableトレイト(型ではなくtrait名)のため、
     * IDEがjobPostings()等のCompany固有メソッドを未定義扱いにしてしまう。ここで具象クラスの型を明示する
     */
    private function findCompanyByStripeId(?string $stripeId): ?Company
    {
        return $this->getUserByStripeId($stripeId);
    }
}
