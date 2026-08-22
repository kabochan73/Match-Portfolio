<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 反応期限(7日)を過ぎたlikesをexpiredに更新する。DB_DESIGN.md「マッチ失効バッチ」
Schedule::command('likes:expire')->hourly();

// 作成から1ヶ月経過した通知を削除し、notificationsテーブルの肥大化を防ぐ
Schedule::command('notifications:prune')->daily();
