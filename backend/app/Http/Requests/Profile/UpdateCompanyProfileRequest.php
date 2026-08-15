<?php

namespace App\Http\Requests\Profile;

use App\Enums\MemberCountRange;
use App\Enums\Prefecture;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateCompanyProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * RegisterCompanyRequestと同じ項目・制約(email/passwordはここでは扱わない)
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'prefecture' => ['nullable', Rule::in(Prefecture::values())],
            'address_line' => ['nullable', 'string', 'max:255'],
            'founded_year' => ['nullable', 'integer', 'between:1800,'.now()->year],
            'member_count_range' => ['nullable', new Enum(MemberCountRange::class)],
            'website_url' => ['nullable', 'string', 'url', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => '会社名',
            'description' => '会社概要',
            'phone_number' => '電話番号',
            'prefecture' => '都道府県',
            'address_line' => '市区町村以下の住所',
            'founded_year' => '設立年',
            'member_count_range' => 'メンバー数',
            'website_url' => 'WebサイトURL',
        ];
    }
}
