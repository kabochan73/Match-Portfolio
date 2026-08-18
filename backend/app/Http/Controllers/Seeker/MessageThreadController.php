<?php

namespace App\Http\Controllers\Seeker;

use App\Enums\LikeStatus;
use App\Http\Controllers\Concerns\ManagesMessageThreads;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MessageThreadController extends Controller
{
    use ManagesMessageThreads;

    /**
     * 認証中の求職者のメッセージスレッド一覧。マッチ成立済み、かつ自分が非表示にしていないもののみ返す。
     * 本来は最新メッセージ順が理想だが、シンプルさのためマッチ成立日時(company_responded_at)の降順とする
     */
    public function index(Request $request): JsonResponse
    {
        $threads = $request->user('web')->likes()
            ->where('status', LikeStatus::Matched->value)
            ->whereNull('user_hidden_at')
            ->with(['jobPosting:id,company_id,title', 'jobPosting.company:id,name,avatar_path', 'latestMessage'])
            ->withCount(['messages as unread_messages_count' => fn ($query) => $query->where('sender_type', 'company')->whereNull('read_at')])
            ->latest('company_responded_at')
            ->get();

        return response()->json($threads);
    }

    /**
     * スレッドを自分の一覧から非表示にする(相手[企業]側には引き続き表示される)
     */
    public function hide(Request $request, int $like): Response
    {
        $thread = $this->findMatchedThread($request->user('web')->likes(), $like);

        $thread->update(['user_hidden_at' => now()]);

        return response()->noContent();
    }
}
