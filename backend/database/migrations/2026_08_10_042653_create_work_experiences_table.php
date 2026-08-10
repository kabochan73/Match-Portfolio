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
        Schema::create('work_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('company_name');
            $table->date('started_on');
            // 終了年月がnullの場合は「在籍中」を表す
            $table->date('ended_on')->nullable();
            $table->string('employment_type');
            $table->timestamps();

            // 求職者ごとの職歴一覧取得(started_on降順で表示)を高速化するための索引
            $table->index('user_id');
        });

        DB::statement("
            ALTER TABLE work_experiences
            ADD CONSTRAINT work_experiences_employment_type_check
            CHECK (employment_type IN ('full_time', 'part_time', 'contract'))
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_experiences');
    }
};
