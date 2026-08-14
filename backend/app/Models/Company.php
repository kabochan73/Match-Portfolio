<?php

namespace App\Models;

use App\Enums\MemberCountRange;
use App\Enums\Prefecture;
use Database\Factories\CompanyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

// Userと同様、companiesは1社1アカウントのログイン主体を兼ねるためAuthenticatableを継承する
#[Fillable([
    'name', 'email', 'password', 'description', 'phone_number',
    'prefecture', 'address_line', 'founded_year', 'member_count_range', 'website_url',
    'avatar_path', 'cover_image_path',
])]
#[Hidden(['password'])]
class Company extends Authenticatable
{
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
