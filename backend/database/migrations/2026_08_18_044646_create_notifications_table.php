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
        // Laravel標準の通知テーブル(php artisan make:notifications-table生成のまま)。
        // notifiable_type/notifiable_idはApp\Models\User / App\Models\Companyのどちらも指す
        // (マッチ成立・新着メッセージ・新しい応募のいずれもアプリ内通知のみで、メール送信はしない)
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
