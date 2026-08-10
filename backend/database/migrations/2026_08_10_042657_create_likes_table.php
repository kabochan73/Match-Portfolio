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
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('job_posting_id')->constrained();
            $table->string('like_type')->default('standard');
            // 志望動機。企業ごとに個別入力する自由記述で文字数上限なし
            $table->text('motivation');
            $table->string('status')->default('applied');
            $table->timestamp('applied_at');
            // applied_at + 7日。企業がこの日時までに反応しないと自動的にexpiredになる
            $table->timestamp('response_deadline');
            $table->timestamp('company_responded_at')->nullable();
            // 求職者・企業がそれぞれ自分のメッセージ一覧からこのスレッドを非表示にした日時
            $table->timestamp('user_hidden_at')->nullable();
            $table->timestamp('company_hidden_at')->nullable();
            $table->timestamps();

            // 月間上限(通常10件/スーパー1件)を都度集計するクエリ用の複合索引
            $table->index(['user_id', 'like_type', 'applied_at']);
            $table->index('job_posting_id');
        });

        DB::statement("
            ALTER TABLE likes
            ADD CONSTRAINT likes_like_type_check
            CHECK (like_type IN ('standard', 'super'))
        ");

        DB::statement("
            ALTER TABLE likes
            ADD CONSTRAINT likes_status_check
            CHECK (status IN ('applied', 'matched', 'expired'))
        ");

        // 部分ユニークインデックス: 反応待ち・マッチ中の同一求人への重複応募は防ぐが、
        // expired(マッチ不成立)になった求人には再応募できるようexpiredレコードは対象外にする。
        // Laravelのスキーマビルダには部分インデックスを組み立てるfluentな手段がないため生SQLで作成する
        DB::statement("
            CREATE UNIQUE INDEX likes_user_id_job_posting_id_unique
            ON likes (user_id, job_posting_id)
            WHERE status <> 'expired'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};
