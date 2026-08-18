<?php

namespace App\Notifications;

use App\Models\Like;
use Illuminate\Notifications\Notification;

/**
 * 応募先企業が「気になる」を送りマッチが成立したことを求職者に通知する。アプリ内通知のみでメール送信はしない
 */
class LikeMatched extends Notification
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
            'company_name' => $this->like->jobPosting->company->name,
        ];
    }
}
