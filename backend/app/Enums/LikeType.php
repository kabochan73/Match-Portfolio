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
}
