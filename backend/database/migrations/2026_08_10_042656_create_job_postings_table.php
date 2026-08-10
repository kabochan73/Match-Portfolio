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
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained();
            $table->string('title');
            $table->text('description');
            $table->text('desired_candidate');
            $table->string('employment_type');
            // 勤務地。companies.prefectureと共通のenumに「リモート」を加えたもの。検索の絞り込み条件
            $table->string('prefecture');
            // 月給(円)。表示専用で絞り込みには使わない
            $table->integer('salary_min');
            $table->integer('salary_max');
            $table->string('status')->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // 検索の絞り込み(status, prefecture, employment_type)を高速化する複合索引
            $table->index(['status', 'prefecture', 'employment_type']);
        });

        DB::statement("
            ALTER TABLE job_postings
            ADD CONSTRAINT job_postings_employment_type_check
            CHECK (employment_type IN ('full_time', 'part_time', 'contract'))
        ");

        DB::statement("
            ALTER TABLE job_postings
            ADD CONSTRAINT job_postings_status_check
            CHECK (status IN ('draft', 'published', 'unpublished', 'closed'))
        ");

        $prefectureList = collect([
            '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
            '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
            '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
            '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
            '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
            '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
            '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
            // companies.prefectureとの違いは、勤務地の選択肢として「リモート」を含める点のみ
            'リモート',
        ])
            ->map(fn (string $prefecture) => "'{$prefecture}'")
            ->implode(',');

        DB::statement("
            ALTER TABLE job_postings
            ADD CONSTRAINT job_postings_prefecture_check
            CHECK (prefecture IN ({$prefectureList}))
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
