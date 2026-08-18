<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

/**
 * メッセージスレッドに新着メッセージが届いたことを受信側(求職者 or 企業)に通知する。
 * アプリ内通知のみでメール送信はしない
 */
class NewMessage extends Notification
{
    public function __construct(private readonly Message $message) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'like_id' => $this->message->like_id,
            'message_id' => $this->message->id,
            'sender_type' => $this->message->sender_type,
            'body' => Str::limit($this->message->body, 50),
        ];
    }
}
