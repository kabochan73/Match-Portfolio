<?php

namespace App\Http\Requests\Profile;

use App\Http\Requests\Concerns\ValidatesBirthDate;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserProfileRequest extends FormRequest
{
    use ValidatesBirthDate;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'comment' => ['nullable', 'string', 'max:200'],
            'portfolio_url' => ['nullable', 'string', 'url', 'max:255'],
            'birth_date' => $this->birthDateRules(),
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => '氏名',
            'comment' => '自己紹介コメント',
            'portfolio_url' => 'ポートフォリオURL',
            'birth_date' => '生年月日',
        ];
    }
}
