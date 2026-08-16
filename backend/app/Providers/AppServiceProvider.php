<?php

namespace App\Providers;

use App\Models\Company;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;
use Laravel\Cashier\Cashier;

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

        // Cashierはデフォルトで顧客モデルをApp\Models\Userとみなす(findBillable等の内部検索に使われる)。
        // このアプリでBillableなのはCompanyなので明示的に差し替える
        Cashier::useCustomerModel(Company::class);

        // パスワードリセット通知のリンク先は、デフォルトだとバックエンドの名前付きルートを指すが、
        // このアプリはNext.js側にリセット画面を持つSPA構成のため、フロントエンドのURLを指すよう差し替える。
        // User/Companyのどちらからのリクエストかでパスを分ける(2つのガードでリセット画面が別なため)
        ResetPassword::createUrlUsing(function (object $notifiable, string $token): string {
            $path = $notifiable instanceof Company ? 'company/reset-password' : 'seeker/reset-password';

            return sprintf(
                '%s/%s?token=%s&email=%s',
                config('app.frontend_url'),
                $path,
                $token,
                urlencode($notifiable->getEmailForPasswordReset())
            );
        });
    }
}
