<?php

namespace App\Models;

use App\Enums\BillingStatus;
use App\Enums\MemberCountRange;
use App\Enums\Prefecture;
use Database\Factories\CompanyFactory;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Cashier\Billable;

// Userと同様、companiesは1社1アカウントのログイン主体を兼ねるためAuthenticatableを継承する
#[Fillable([
    'name', 'email', 'password', 'description', 'phone_number',
    'prefecture', 'address_line', 'founded_year', 'member_count_range', 'website_url',
    'avatar_path',
])]
// avatar_pathはストレージ上の相対パスという実装詳細なので隠し、
// 代わりにavatar_url(完全なURL)をJSONへ含める。stripe_idも同様に内部実装なので隠す
#[Hidden(['password', 'avatar_path', 'stripe_id'])]
#[Appends(['avatar_url'])]
class Company extends Authenticatable
{
    // 企業単位でStripeの1顧客・1サブスクリプション(name="default")として課金する(DB_DESIGN.md「4. 補足」参照)
    use Billable;

    /** @use HasFactory<CompanyFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'founded_year' => 'integer',
            // nullableなカラムだが、backed enumへのキャストはnullをそのまま通してくれる
            'prefecture' => Prefecture::class,
            'member_count_range' => MemberCountRange::class,
        ];
    }

    /**
     * @return Attribute<string|null, never>
     */
    protected function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->avatar_path ? self::publicDisk()->url($this->avatar_path) : null,
        );
    }

    /**
     * Storage::disk()の戻り値はFilesystem contract型で、url()はcontractに含まれないため
     * (public/local disk限定のメソッド)、IDEが未定義メソッド扱いにしてしまう。
     * ここで具象クラスの型を明示し、avatarUrlアクセサから使い回す
     */
    private static function publicDisk(): FilesystemAdapter
    {
        return Storage::disk('public');
    }

    /**
     * 未認証の公開エンドポイント(Public\CompanyController等)で選択するカラム一覧。
     * emailはログイン用の個人情報であり、他のHidden項目と違って企業自身の認証済み画面では
     * 必要なためモデル全体では隠さず、公開向けのselectでのみ明示的に除外する
     *
     * @return list<string>
     */
    public static function publicColumns(): array
    {
        return [
            'id', 'name', 'description', 'phone_number',
            'prefecture', 'address_line', 'founded_year', 'member_count_range', 'website_url',
            'avatar_path',
        ];
    }

    /**
     * @return HasMany<JobPosting, $this>
     */
    public function jobPostings(): HasMany
    {
        return $this->hasMany(JobPosting::class);
    }

    /**
     * プロフィール用の写真ギャラリー(最大5枚、job_posting_imagesと同じ仕組み)
     *
     * @return HasMany<CompanyImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(CompanyImage::class)->orderBy('position');
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * 課金ステータス(未契約/課金中/未払い)。Cashierのsubscription('default')の状態から都度導出する。
     * Subscription::active()はCashierのデフォルト設定でpast_due/unpaidの場合にfalseを返すため、
     * 「未契約でもなくactiveでもない」場合はまとめて未払い扱いとする。ただしSubscription::ended()
     * (解約済みかつ猶予期間も終了)な場合は例外で、これは「もう有効な契約が存在しない」状態であり
     * 未払いではなく未契約として扱う(そうしないとBillingController::checkout()が
     * 「既に契約されています」を返し続け、解約後に再契約する手段がなくなってしまう)
     */
    public function billingStatus(): BillingStatus
    {
        $subscription = $this->subscription('default');

        return match (true) {
            $subscription === null => BillingStatus::Uncontracted,
            $subscription->ended() => BillingStatus::Uncontracted,
            $subscription->active() => BillingStatus::Active,
            default => BillingStatus::Unpaid,
        };
    }
}
