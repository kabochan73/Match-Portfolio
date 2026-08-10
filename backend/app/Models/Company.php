<?php

namespace App\Models;

use Database\Factories\CompanyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

// Userと同様、companiesは1社1アカウントのログイン主体を兼ねるためAuthenticatableを継承する
#[Fillable([
    'name', 'email', 'password', 'description', 'phone_number',
    'prefecture', 'address_line', 'founded_year', 'member_count_range', 'website_url',
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
        ];
    }
}
