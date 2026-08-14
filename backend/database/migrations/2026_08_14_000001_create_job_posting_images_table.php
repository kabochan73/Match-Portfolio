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
        Schema::create('job_posting_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_posting_id')->constrained()->cascadeOnDelete();
            // 画像自体はストレージ(public disk)に保存し、ここには相対パスのみ持つ
            $table->string('path');
            // 表示順(0始まり)。企業側で並び替え可能にするための列
            $table->unsignedTinyInteger('position');
            $table->timestamps();

            // 求人ごとの画像一覧取得(position昇順で表示)を高速化するための索引
            // 同一求人内でのposition重複も防ぐ(最大5枚という上限自体はアプリ側で検証する)
            $table->unique(['job_posting_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_posting_images');
    }
};
