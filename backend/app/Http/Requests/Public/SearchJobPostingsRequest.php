<?php

namespace App\Http\Requests\Public;

use App\Enums\EmploymentType;
use App\Enums\Prefecture;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * 公開求人一覧の検索・絞り込み(REQUIREMENTS.md 4.2: キーワード[タイトル・職務内容] +
 * 勤務地 + 雇用形態)。全項目任意で、未指定の場合は絞り込みなし
 */
class SearchJobPostingsRequest extends FormRequest
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
            'keyword' => ['nullable', 'string', 'max:255'],
            // 求人の勤務地はcompaniesと共通のPrefecture enumに加えて「リモート」も選択肢に含む
            'prefecture' => ['nullable', Rule::in([...Prefecture::values(), 'リモート'])],
            'employment_type' => ['nullable', Rule::enum(EmploymentType::class)],
            // /companies/[id]の「掲載中の求人」欄向け。企業を指定した場合、その企業の求人のみに絞る
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'keyword' => 'キーワード',
            'prefecture' => '勤務地',
            'employment_type' => '雇用形態',
            'company_id' => '企業',
        ];
    }
}
