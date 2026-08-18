<?php

namespace App\Http\Controllers\Concerns;

use App\Enums\LikeStatus;
use App\Models\Like;
use App\Models\Message;
use Illuminate\Contracts\Database\Eloquent\Builder;

/**
 * メッセージスレッド(=マッチ成立済みのlikes)まわりの、求職者・企業で共通の操作をまとめたtrait。
 * 「自分がどちらの当事者か」を表す$viewerType/$senderType('user'|'company')を引数で受け取ることで、
 * 求職者側・企業側どちらのコントローラからも同じロジックを使い回せるようにしている
 */
trait ManagesMessageThreads
{
    /**
     * $scopedLikes(自分の求人 or 自分の応募であらかじめスコープ済みのクエリ)からマッチ成立中の
     * スレッドを1件取得する。マッチ未成立・スコープ外のIDは404にする
     * (存在しないIDと同様に扱うことで、他者のスレッドの存在有無も推測されない)
     */
    protected function findMatchedThread(Builder $scopedLikes, int $like): Like
    {
        return $scopedLikes->where('status', LikeStatus::Matched->value)->findOrFail($like);
    }

    /**
     * 相手から届いた未読メッセージを既読にする。スレッドを開いた(一覧を取得した)タイミングで呼ぶ
     */
    protected function markIncomingMessagesRead(Like $thread, string $viewerType): void
    {
        $thread->messages()
            ->where('sender_type', '!=', $viewerType)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    /**
     * メッセージを送信する。受信側が過去にこのスレッドを自分の一覧から非表示にしていた場合、
     * 新着メッセージをきっかけに再表示させる(DB_DESIGN.mdの方針)
     */
    protected function sendMessage(Like $thread, string $senderType, int $senderId, string $body): Message
    {
        $message = $thread->messages()->create([
            'sender_type' => $senderType,
            'sender_id' => $senderId,
            'body' => $body,
        ]);

        $thread->update([
            $senderType === 'user' ? 'company_hidden_at' : 'user_hidden_at' => null,
        ]);

        return $message;
    }
}
