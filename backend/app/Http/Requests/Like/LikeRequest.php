<?php

namespace App\Http\Requests\Like;

use App\Enums\JobPostingStatus;
use App\Enums\LikeStatus;
use App\Enums\LikeType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * 求人への「いいね」(=応募)作成リクエスト
 */
class LikeRequest extends FormRequest
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
            // 公開中の求人のみを応募対象にする(下書き・非公開・募集終了の求人IDはexists対象外として弾く)
            'job_posting_id' => [
                'required',
                Rule::exists('job_postings', 'id')->where('status', JobPostingStatus::Published->value),
            ],
            'like_type' => ['required', Rule::enum(LikeType::class)],
            'motivation' => ['required', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'job_posting_id' => '求人',
            'like_type' => 'いいねの種類',
            'motivation' => '志望動機',
        ];
    }

    /**
     * 単純なルールだけでは表現できない業務ルール(重複応募・月間上限)をここで検証する。
     * ここでのチェックはロックを取らないため、同時リクエストによるレースコンディションでは
     * すり抜ける可能性がある(通常操作での即時フィードバック用)。最終的な担保は
     * Seeker\LikeController::store()がトランザクション+行ロック内で行う再検証
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->has('job_posting_id')) {
                return;
            }

            $user = $this->user('web');

            $hasActiveLike = $user->likes()
                ->where('job_posting_id', $this->input('job_posting_id'))
                ->where('status', '!=', LikeStatus::Expired->value)
                ->exists();

            if ($hasActiveLike) {
                $validator->errors()->add('job_posting_id', 'この求人にはすでに応募済みです。');
            }

            if ($validator->errors()->has('like_type')) {
                return;
            }

            $likeType = LikeType::from($this->input('like_type'));
            $limit = $likeType->monthlyLimit();
            $usedThisMonth = $user->likesUsedThisMonth($likeType);

            if ($usedThisMonth >= $limit) {
                $label = $likeType === LikeType::Super ? 'スーパーいいね' : '通常のいいね';
                $validator->errors()->add('like_type', "今月の{$label}の上限({$limit}件)に達しています。");
            }
        });
    }
}
