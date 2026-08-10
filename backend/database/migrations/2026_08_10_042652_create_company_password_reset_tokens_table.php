<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // usersとcompaniesは別Sanctumガードの別テーブルであり、同じメールアドレスが
        // 両方に存在しうるため、標準のpassword_reset_tokens(users用)とは別にガードごとに分離する
        Schema::create('company_password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_password_reset_tokens');
    }
};
