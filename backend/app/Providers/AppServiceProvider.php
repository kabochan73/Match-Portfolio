<?php

namespace App\Providers;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // messages.sender_type は 'user'/'company' という短い文字列でDBに保存する簡易ポリモーフィックのため、
        // Eloquentのmorph mapを登録して実際のモデルクラス(App\Models\User/Company)に解決できるようにする。
        // enforceMorphMapにすることで、登録外のクラス名がsender_typeに紛れ込むことを防ぐ
        Relation::enforceMorphMap([
            'user' => User::class,
            'company' => Company::class,
        ]);
    }
}
