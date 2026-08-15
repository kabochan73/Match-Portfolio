<?php

namespace App\Enums;

/**
 * job_postings.status のCHECK制約と対応する求人の公開状態
 */
enum JobPostingStatus: string
{
    // 作成済み・未公開
    case Draft = 'draft';

    // 公開中(検索結果に表示)
    case Published = 'published';

    // 支払い未了により自動非公開。企業が直接この値にはできず、Cashierのwebhookからのみ設定される
    case Unpublished = 'unpublished';

    // 企業が募集終了(恒久的に非表示)
    case Closed = 'closed';
}
