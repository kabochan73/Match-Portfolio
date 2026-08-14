<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * アバター・カバー画像など、単一の画像ファイルをアップロードするエンドポイントで共通して使うリクエスト。
 * 認可(ログイン確認)はルート側のミドルウェア(auth:web / auth:company)で行う
 */
class UpdateImageRequest extends FormRequest
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
            // mimesでSVG・GIF等を除外し、jpeg/png/webpのみ許可する(imageルール単体だとSVGも通ってしまいXSSのリスクがあるため)
            'image' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'image' => '画像',
        ];
    }
}
