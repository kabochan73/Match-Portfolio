<?php

namespace App\Http\Requests\JobPosting;

use App\Enums\EmploymentType;
use App\Enums\Prefecture;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * 求人の投稿・編集で共通して使うリクエスト。statusはここでは扱わず、
 * 公開/非公開/募集終了は専用のエンドポイント(JobPostingController::publish等)で切り替える
 */
class JobPostingRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'desired_candidate' => ['required', 'string'],
            'employment_type' => ['required', Rule::enum(EmploymentType::class)],
            // companiesの所在地(Prefecture enum)に「リモート」を加えた選択肢
            'prefecture' => ['required', Rule::in([...Prefecture::values(), 'リモート'])],
            'salary_min' => ['required', 'integer', 'min:0'],
            'salary_max' => ['required', 'integer', 'gte:salary_min'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => '求人タイトル',
            'description' => '職務内容',
            'desired_candidate' => '求める人材像',
            'employment_type' => '雇用形態',
            'prefecture' => '勤務地',
            'salary_min' => '月給(下限)',
            'salary_max' => '月給(上限)',
        ];
    }
}
