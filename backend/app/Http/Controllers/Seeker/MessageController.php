<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Concerns\ManagesMessageThreads;
use App\Http\Controllers\Controller;
use App\Http\Requests\Message\MessageRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    use ManagesMessageThreads;

    /**
     * スレッド内のメッセージ一覧(古い順)。表示と同時に企業からの未読メッセージを既読にする
     */
    public function index(Request $request, int $like): JsonResponse
    {
        $thread = $this->findMatchedThread($request->user('web')->likes(), $like);

        $this->markIncomingMessagesRead($thread, 'user');

        return response()->json($thread->messages()->get());
    }

    /**
     * マッチ成立中のスレッドへメッセージを送信する
     */
    public function store(MessageRequest $request, int $like): JsonResponse
    {
        $thread = $this->findMatchedThread($request->user('web')->likes(), $like);

        $message = $this->sendMessage($thread, 'user', $request->user('web')->id, $request->validated('body'));

        return response()->json($message, 201);
    }
}
