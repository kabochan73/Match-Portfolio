<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 都道府県の一覧(companiesの所在地、job_postingsの勤務地で共通して使うenum値)。
     * job_postings側ではこれに「リモート」を加えて使う。
     */
    public static function prefectures(): array
    {
        return [
            '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
            '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
            '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
            '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
            '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
            '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
            '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
        ];
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->text('description')->nullable();
            $table->string('phone_number')->nullable();
            // 所在地(都道府県)。job_postings.prefectureとは別カラムで、絞り込みには使わない表示専用の項目
            $table->string('prefecture')->nullable();
            $table->string('address_line')->nullable();
            $table->unsignedSmallInteger('founded_year')->nullable();
            $table->string('member_count_range')->nullable();
            $table->string('website_url')->nullable();
            // プロフィール画像(ロゴ等)。画像自体はストレージ(public disk)に保存し、ここには相対パスのみ持つ
            $table->string('avatar_path')->nullable();
            // Laravel CashierのBillableトレイトが内部でこのカラム名を決め打ちで参照するため、
            // Cashier標準のカラム名(stripe_id)に合わせている
            $table->string('stripe_id')->nullable()->unique();
            $table->timestamps();
        });

        // enum系カラムはPHP側のenumキャスト・バリデーションに加え、
        // DB層の最後の防波堤としてCHECK制約でも値を制限する(DB_DESIGN.md「4. 補足」参照)
        $prefectureList = collect(self::prefectures())
            ->map(fn (string $prefecture) => "'{$prefecture}'")
            ->implode(',');

        DB::statement("
            ALTER TABLE companies
            ADD CONSTRAINT companies_prefecture_check
            CHECK (prefecture IN ({$prefectureList}))
        ");

        DB::statement("
            ALTER TABLE companies
            ADD CONSTRAINT companies_member_count_range_check
            CHECK (member_count_range IN ('1_10', '11_50', '51_100', '101_300', '301_plus'))
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
