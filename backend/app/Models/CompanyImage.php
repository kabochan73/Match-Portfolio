<?php

namespace App\Models;

use Database\Factories\CompanyImageFactory;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

#[Fillable(['company_id', 'path', 'position'])]
// pathはストレージ上の相対パスという実装詳細なので隠し、代わりにurl(完全なURL)をJSONへ含める
// (JobPostingImageと同じ方針)
#[Hidden(['path'])]
#[Appends(['url'])]
class CompanyImage extends Model
{
    /** @use HasFactory<CompanyImageFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'position' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * @return Attribute<string, never>
     */
    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn () => self::publicDisk()->url($this->path),
        );
    }

    /**
     * Storage::disk()の戻り値はFilesystem contract型で、url()はcontractに含まれないため
     * (public/local disk限定のメソッド)、IDEが未定義メソッド扱いにしてしまう。
     * ここで具象クラスの型を明示する(JobPostingImage::publicDisk()と同じ回避策)
     */
    private static function publicDisk(): FilesystemAdapter
    {
        return Storage::disk('public');
    }
}
