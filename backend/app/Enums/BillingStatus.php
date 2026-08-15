<?php

namespace App\Enums;

/**
 * 企業の課金ステータス(REQUIREMENTS.md 4.4)。Cashierのsubscriptions.stripe_statusを
 * このアプリで意味のある3値に単純化したもの(DB上には独自のカラムを持たず、都度導出する)
 */
enum BillingStatus: string
{
    // サブスクリプション未開始
    case Uncontracted = 'uncontracted';

    // 決済有効。求人を公開できる
    case Active = 'active';

    // 決済失敗(延滞・未払い等)により求人が自動非公開になっている状態
    case Unpaid = 'unpaid';
}
