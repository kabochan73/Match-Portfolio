<?php

namespace App\Notifications;

use App\Models\Like;
use Illuminate\Notifications\Notification;

/**
 * 求職者が自社の求人に応募(いいね)したことを企業に通知する。アプリ内通知のみでメール送信はしない
 */
class NewApplication extends Notification
{
    public function __construct(private readonly Like $like) {}

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
            'like_id' => $this->like->id,
            'job_posting_id' => $this->like->job_posting_id,
            'job_posting_title' => $this->like->jobPosting->title,
            'applicant_name' => $this->like->user->name,
            'like_type' => $this->like->like_type,
        ];
    }
}
