<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Notifications\DatabaseNotification;

class PruneNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:prune';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '作成から1ヶ月経過した通知(求職者・企業共通のnotificationsテーブル)を削除する';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = DatabaseNotification::query()
            ->where('created_at', '<', now()->subMonth())
            ->delete();

        $this->info("{$count}件の通知を削除しました。");

        return self::SUCCESS;
    }
}
