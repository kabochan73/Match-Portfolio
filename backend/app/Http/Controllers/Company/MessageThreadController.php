<?php

namespace App\Http\Controllers\Company;

use App\Enums\LikeStatus;
use App\Http\Controllers\Concerns\ManagesMessageThreads;
use App\Http\Controllers\Controller;
use App\Models\Like;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MessageThreadController extends Controller
{
    use ManagesMessageThreads;

    /**
     * 認証中の企業のメッセージスレッド一覧。マッチ成立済み、かつ自分が非表示にしていないもののみ返す
     */
    public function index(Request $request): JsonResponse
    {
        $threads = $this->companyLikes($request)
            ->where('status', LikeStatus::Matched->value)
            ->whereNull('company_hidden_at')
            ->with(['user:id,name,avatar_path', 'jobPosting:id,title', 'latestMessage'])
            ->withCount(['messages as unread_messages_count' => fn ($query) => $query->where('sender_type', 'user')->whereNull('read_at')])
            ->latest('company_responded_at')
            ->get();

        return response()->json($threads);
    }

    /**
     * スレッドを自分の一覧から非表示にする(相手[求職者]側には引き続き表示される)
     */
    public function hide(Request $request, int $like): Response
    {
        $thread = $this->findMatchedThread($this->companyLikes($request), $like);

        $thread->update(['company_hidden_at' => now()]);

        return response()->noContent();
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
