<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Billableなのはusersではなくcompanies(1社1アカウントがStripeの1顧客に対応)。
     * stripe_idはcompaniesの作成マイグレーションで既にnullable+unique付きで定義済みのため、
     * ここではCashierが追加で必要とするpm_type/pm_last_four/trial_ends_atのみ追加する
     * (トライアルなしの要件だがtrial_ends_atはCashier内部の判定で参照されるため残す)
     */
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('pm_type')->nullable();
            $table->string('pm_last_four', 4)->nullable();
            $table->timestamp('trial_ends_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'pm_type',
                'pm_last_four',
                'trial_ends_at',
            ]);
        });
    }
};
