<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
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
            // dateにキャストすることでCarbonインスタンスとして扱えるようにする(年齢計算等で使う)
            'birth_date' => 'date',
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
}
