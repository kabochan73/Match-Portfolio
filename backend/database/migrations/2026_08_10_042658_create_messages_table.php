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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('like_id')->constrained()->cascadeOnDelete();
            // sender_type/sender_idは簡易ポリモーフィック。送信者がuser/companyのどちらかを表す
            $table->string('sender_type');
            $table->unsignedBigInteger('sender_id');
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            // メッセージは編集されない前提のためupdated_atは持たない
            $table->timestamp('created_at')->useCurrent();

            // スレッド(like_id)ごとにcreated_at順で取得する一覧表示を高速化する索引
            $table->index(['like_id', 'created_at']);
        });

        DB::statement("
            ALTER TABLE messages
            ADD CONSTRAINT messages_sender_type_check
            CHECK (sender_type IN ('user', 'company'))
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
