<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterUserRequest extends FormRequest
{
    /**
     * 会員登録は誰でも実行できる操作なので常にtrue(ログイン済みかどうかのチェックはルート側のミドルウェアで行う)
     */
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
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            // confirmedルールにより、リクエストにpassword_confirmationも一致させて送る必要がある
            'password' => ['required', 'confirmed', Password::defaults()],
            'comment' => ['nullable', 'string', 'max:200'],
            'portfolio_url' => ['nullable', 'string', 'url', 'max:255'],
            // 18歳以上60歳以下のみ登録可能(DB_DESIGN.md参照)。基準日は「今日」なのでリクエストのたびに動的に計算する
            'birth_date' => [
                'required',
                'date',
                'before_or_equal:'.now()->subYears(18)->toDateString(),
                'after_or_equal:'.now()->subYears(60)->toDateString(),
            ],
        ];
    }

    /**
     * バリデーションエラーメッセージ内で使われる項目名を日本語化する
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => '氏名',
            'email' => 'メールアドレス',
            'password' => 'パスワード',
            'comment' => '自己紹介コメント',
            'portfolio_url' => 'ポートフォリオURL',
            'birth_date' => '生年月日',
        ];
    }
}
