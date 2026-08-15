<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * 資格の登録・編集で共通して使うリクエスト
 */
class CertificationRequest extends FormRequest
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
        // 同一資格の重複登録防止(DB側のunique(user_id, name)制約と対応)。
        // 更新時は自分自身のレコードを重複判定から除外する
        $uniqueRule = Rule::unique('certifications')->where('user_id', $this->user('web')->id);

        if ($this->route('certification')) {
            $uniqueRule->ignore($this->route('certification'));
        }

        return [
            'name' => ['required', 'string', 'max:255', $uniqueRule],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => '資格名',
        ];
    }
}
