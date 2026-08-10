<?php

namespace App\Models;

use Database\Factories\MessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable(['like_id', 'sender_type', 'sender_id', 'body', 'read_at'])]
class Message extends Model
{
    /** @use HasFactory<MessageFactory> */
    use HasFactory;

    // メッセージは編集されない前提でupdated_atカラムを持たないため、Eloquentにも追跡させない
    const UPDATED_AT = null;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Like, $this>
     */
    public function like(): BelongsTo
    {
        return $this->belongsTo(Like::class);
    }

    /**
     * 送信者(User or Company)。sender_type は 'user'/'company' という短い文字列で持つため、
     * AppServiceProviderでmorph mapを登録し、実際のモデルクラスに解決できるようにしている
     *
     * @return MorphTo<Model, $this>
     */
    public function sender(): MorphTo
    {
        return $this->morphTo();
    }
}
