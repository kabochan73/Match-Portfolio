<?php

namespace App\Console\Commands;

use App\Enums\LikeStatus;
use App\Models\Like;
use Illuminate\Console\Command;

class ExpireLikes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'likes:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'response_deadlineを過ぎた反応待ちのlikesをexpiredに更新する';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = Like::query()
            ->where('status', LikeStatus::Applied->value)
            ->where('response_deadline', '<', now())
            ->update(['status' => LikeStatus::Expired->value]);

        $this->info("{$count}件のlikesをexpiredに更新しました。");

        return self::SUCCESS;
    }
}
