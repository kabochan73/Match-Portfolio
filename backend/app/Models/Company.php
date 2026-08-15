<?php

namespace App\Models;

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
    'avatar_path', 'cover_image_path',
])]
// avatar_path/cover_image_pathはストレージ上の相対パスという実装詳細なので隠し、
// 代わりにavatar_url/cover_image_url(完全なURL)をJSONへ含める。stripe_idも同様に内部実装なので隠す
#[Hidden(['password', 'avatar_path', 'cover_image_path', 'stripe_id'])]
#[Appends(['avatar_url', 'cover_image_url'])]
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
     * @return Attribute<string|null, never>
     */
    protected function coverImageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->cover_image_path ? self::publicDisk()->url($this->cover_image_path) : null,
        );
    }

    /**
     * Storage::disk()の戻り値はFilesystem contract型で、url()はcontractに含まれないため
     * (public/local disk限定のメソッド)、IDEが未定義メソッド扱いにしてしまう。
     * ここで具象クラスの型を明示し、avatarUrl/coverImageUrlアクセサから使い回す
     */
    private static function publicDisk(): FilesystemAdapter
    {
        return Storage::disk('public');
    }

    /**
     * @return HasMany<JobPosting, $this>
     */
    public function jobPostings(): HasMany
    {
        return $this->hasMany(JobPosting::class);
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
