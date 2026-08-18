<?php

namespace App\Enums;

/**
 * likes.status のCHECK制約と対応するマッチング状態
 */
enum LikeStatus: string
{
    // いいね(応募)直後。企業の反応待ち
    case Applied = 'applied';

    // 企業が7日以内に「気になる」を押し、マッチ成立
    case Matched = 'matched';

    // 7日以内に企業の反応がなく自動的に不成立(likes:expireバッチが更新する)。同一求人へ再応募可能
    case Expired = 'expired';
}
