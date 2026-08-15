<?php

namespace App\Http\Requests\Profile;

use App\Enums\EmploymentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * 職歴の登録・編集で共通して使うリクエスト(項目・制約が同一のため、AvatarのUpdateImageRequestと同様に共用する)
 */
class WorkExperienceRequest extends FormRequest
{
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
            'company_name' => ['required', 'string', 'max:255'],
            'started_on' => ['required', 'date'],
            // 未入力は「在籍中」を表す
            'ended_on' => ['nullable', 'date', 'after_or_equal:started_on'],
            'employment_type' => ['required', Rule::enum(EmploymentType::class)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'company_name' => '会社名',
            'started_on' => '在籍開始年月',
            'ended_on' => '在籍終了年月',
            'employment_type' => '雇用形態',
        ];
    }
}
