<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 反応期限(7日)を過ぎたlikesをexpiredに更新する。DB_DESIGN.md「マッチ失効バッチ」
Schedule::command('likes:expire')->hourly();
