<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 企業のサブスクリプション自体はLaravel Cashier標準のsubscriptions/subscription_itemsテーブルで管理する。
        // このテーブルはStripe Webhookで同期する請求履歴のキャッシュのみを持つ
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained();
            $table->string('stripe_invoice_id')->unique();
            // 円単位の金額
            $table->integer('amount');
            $table->string('status');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        DB::statement("
            ALTER TABLE payments
            ADD CONSTRAINT payments_status_check
            CHECK (status IN ('paid', 'failed', 'pending'))
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
