<?php

namespace App\Models;

use Database\Factories\EducationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'school_name'])]
class Education extends Model
{
    /** @use HasFactory<EducationFactory> */
    use HasFactory;

    // "education"は英語では不可算名詞としてEloquentに解釈され、テーブル名が
    // 自動推測だと"educations"ではなく"education"になってしまうため明示的に指定する
    protected $table = 'educations';

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
