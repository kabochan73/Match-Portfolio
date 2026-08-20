<?php

namespace App\Enums;

/**
 * likes.like_type のCHECK制約と対応する「いいね」の種別。
 * 月間上限は種別ごとに別枠で管理する(通常10件/スーパー1件。REQUIREMENTS.md 4.2)
 */
enum LikeType: string
{
    case Standard = 'standard';
    case Super = 'super';

    /**
     * 種別ごとの月間上限件数。LikeRequest(応募時のバリデーション)と
     * LikeController@remaining(残り件数の取得)の両方から参照する
     */
    public function monthlyLimit(): int
    {
        return match ($this) {
            self::Standard => 10,
            self::Super => 1,
        };
    }
}
