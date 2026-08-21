<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\LikeType;
use Database\Factories\UserFactory;
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

#[Fillable(['name', 'email', 'password', 'comment', 'portfolio_url', 'birth_date', 'avatar_path'])]
// avatar_pathはストレージ上の相対パスという実装詳細なので隠し、代わりにavatar_url(完全なURL)をJSONへ含める
#[Hidden(['password', 'avatar_path'])]
#[Appends(['avatar_url'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
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
            // dateにキャストすることでCarbonインスタンスとして扱えるようにする(年齢計算等で使う)。
            // フォーマットをY-m-dに固定しないとJSONシリアライズ時に時刻付きのISO8601文字列になり、
            // <input type="date">がその値を受け付けられない
            'birth_date' => 'date:Y-m-d',
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
     * 職歴一覧。DB_DESIGN.mdの方針通りstarted_onの降順(新しいものが先頭)で返す
     *
     * @return HasMany<WorkExperience, $this>
     */
    public function workExperiences(): HasMany
    {
        return $this->hasMany(WorkExperience::class)->orderByDesc('started_on');
    }

    /**
     * @return HasMany<Education, $this>
     */
    public function educations(): HasMany
    {
        return $this->hasMany(Education::class);
    }

    /**
     * @return HasMany<Certification, $this>
     */
    public function certifications(): HasMany
    {
        return $this->hasMany(Certification::class);
    }

    /**
     * 応募(いいね)一覧
     *
     * @return HasMany<Like, $this>
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    /**
     * 今月すでに使った$likeType種別のいいね数(月初リセット、DB_DESIGN.md「月間上限の数え方」参照)。
     * LikeRequestの応募時バリデーション、LikeController@remaining(残り件数表示)、
     * LikeController@store(トランザクション内での再検証)の3箇所から参照する、唯一の集計ロジック
     */
    public function likesUsedThisMonth(LikeType $likeType): int
    {
        return $this->likes()
            ->where('like_type', $likeType->value)
            ->whereBetween('applied_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();
    }
}
