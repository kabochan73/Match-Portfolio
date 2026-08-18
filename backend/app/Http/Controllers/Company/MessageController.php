<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Concerns\ManagesMessageThreads;
use App\Http\Controllers\Controller;
use App\Http\Requests\Message\MessageRequest;
use App\Models\Like;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    use ManagesMessageThreads;

    /**
     * スレッド内のメッセージ一覧(古い順)。表示と同時に求職者からの未読メッセージを既読にする
     */
    public function index(Request $request, int $like): JsonResponse
    {
        $thread = $this->findMatchedThread($this->companyLikes($request), $like);

        $this->markIncomingMessagesRead($thread, 'company');

        return response()->json($thread->messages()->get());
    }

    /**
     * マッチ成立中のスレッドへメッセージを送信する
     */
    public function store(MessageRequest $request, int $like): JsonResponse
    {
        $thread = $this->findMatchedThread($this->companyLikes($request), $like);

        $message = $this->sendMessage($thread, 'company', $request->user('company')->id, $request->validated('body'));

        return response()->json($message, 201);
    }

    /**
     * likes.jobPosting経由で自社の求人への応募かをスコープする
     */
    private function companyLikes(Request $request): Builder
    {
        return Like::query()->whereHas(
            'jobPosting',
            fn ($query) => $query->where('company_id', $request->user('company')->id)
        );
    }
}
