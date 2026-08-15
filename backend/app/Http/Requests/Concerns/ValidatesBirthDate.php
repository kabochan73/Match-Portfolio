<?php

namespace App\Http\Requests\Concerns;

/**
 * 求職者の生年月日バリデーション(18歳以上60歳以下)。会員登録・プロフィール編集の両方で
 * 同じ制約を使うため、FormRequest間で共有する
 */
trait ValidatesBirthDate
{
    /**
     * @return array<int, string>
     */
    protected function birthDateRules(): array
    {
        return [
            'required',
            'date',
            'before_or_equal:'.now()->subYears(18)->toDateString(),
            'after_or_equal:'.now()->subYears(60)->toDateString(),
        ];
    }
}
