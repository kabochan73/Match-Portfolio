"use client";

// CC。Sanctumのcookie認証データをTanStack Queryで取得する単発の一覧表示のみのページなので、
// 再利用の予定もなくpage.tsx自体をCCにする
import Link from "next/link";
import { AvatarView } from "@/components/company/avatar/AvatarView";
import { PageError, PageLoading } from "@/components/status/PageStatus";
import {
  useHideThread,
  useMessageThreads,
} from "@/hooks/seeker/useMessageThreads";

export default function Page() {
  const { data: threads, isLoading, isError } = useMessageThreads();
  const hideThreadMutation = useHideThread();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      {isLoading && <PageLoading />}

      {isError && <PageError message="メッセージ一覧の取得に失敗しました。" />}

      {threads && threads.length === 0 && (
        <p className="px-4 py-12 text-center text-sm text-zinc-500">
          マッチしたメッセージスレッドはまだありません。
        </p>
      )}

      {threads && threads.length > 0 && (
        <ul className="space-y-4">
          {threads.map((thread) => (
            <li key={thread.id} className="relative">
              <Link
                href={`/seeker/messages/${thread.id}`}
                className="relative flex items-center gap-5 border border-zinc-400 p-5 pb-4 transition hover:border-sky-400 hover:shadow-sm"
              >
                <AvatarView avatarUrl={thread.job_posting.company.avatar_url} />

                <div className="min-w-0 mt-2">
                  <p className="truncate text-lg font-bold text-zinc-900">
                    {thread.job_posting.company.name}
                  </p>
                  <p className="mt-1 truncate text-sm text-zinc-600">
                    {thread.job_posting.title}
                  </p>
                  <p className="mt-1 truncate text-sm text-zinc-500">
                    {thread.latest_message?.body ??
                      "まだメッセージはありません"}
                  </p>
                </div>

                {thread.unread_messages_count > 0 && (
                  <span className="absolute right-5 bottom-4 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-brand px-2 text-xs font-semibold text-white">
                    {thread.unread_messages_count}
                  </span>
                )}
              </Link>

              {/* Linkの兄弟要素として右上に重ねる(aの中にbuttonを入れるとネストしたクリック要素になり
                  カード全体のリンクと競合するため) */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("このマッチを削除しますか？")) {
                    hideThreadMutation.mutate(thread.id);
                  }
                }}
                disabled={hideThreadMutation.isPending}
                className="absolute right-5 top-4 rounded-full border border-red-400 bg-white px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
