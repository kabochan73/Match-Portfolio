<?php

use App\Models\Company;
use Illuminate\Auth\Passwords\PasswordBroker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Laravel\Cashier\Subscription;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

/**
 * Password::broker()の戻り値の型はPasswordBrokerコントラクト(interface)だが、
 * createToken()はこのコントラクトに含まれない(実体であるIlluminate\Auth\Passwords\PasswordBroker
 * クラス固有のメソッド)ため、IDEが未定義メソッド扱いにしてしまう。ここで具象クラスの型を明示し、
 * パスワードリセット系のテストから使い回す
 */
function passwordBroker(string $name): PasswordBroker
{
    return Password::broker($name);
}

/**
 * Stripe APIを叩かずローカルのsubscriptionsテーブルへ直接行を作ることで、
 * billingStatus()等の分岐ロジックだけを検証するためのヘルパー(課金系のテストで共用する)
 */
function createSubscriptionFor(Company $company, string $stripeStatus): Subscription
{
    return Subscription::create([
        'company_id' => $company->id,
        'type' => 'default',
        'stripe_id' => 'sub_'.Str::random(14),
        'stripe_status' => $stripeStatus,
        'stripe_price' => config('services.stripe.job_posting_price_id'),
        'quantity' => 1,
    ]);
}
