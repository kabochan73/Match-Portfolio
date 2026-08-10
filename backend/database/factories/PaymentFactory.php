<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'stripe_invoice_id' => 'in_'.fake()->unique()->bothify('####################'),
            // 企業単位の月額固定サブスクリプション(1,000円)の請求1件分
            'amount' => 1000,
            'status' => 'paid',
            'paid_at' => now(),
        ];
    }
}
