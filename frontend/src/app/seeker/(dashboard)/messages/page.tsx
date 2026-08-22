"use client";

// CC。Sanctumのcookie認証データをTanStack Queryで取得する単発の一覧表示のみのページなので、
// 再利用の予定もなくpage.tsx自体をCCにする
import Link from "next/link";
import { AvatarView } from "@/components/company/avatar/AvatarView";
import { useMessageThreads } from "@/hooks/seeker/useMessageThreads";

export default function Page() {
  const { data: threads, isLoading, isError } = useMessageThreads();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">

      {isLoading && (
        <p className="px-4 py-12 text-center text-sm text-zinc-500">
          読み込み中...
        </p>
      )}

      {isError && (
        <p role="alert" className="px-4 py-12 text-center text-sm text-red-600">
          メッセージ一覧の取得に失敗しました。
        </p>
      )}

      {threads && threads.length === 0 && (
        <p className="px-4 py-12 text-center text-sm text-zinc-500">
          マッチしたメッセージスレッドはまだありません。
        </p>
      )}

      {threads && threads.length > 0 && (
        <ul className="space-y-4">
          {threads.map((thread) => (
            <li key={thread.id}>
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
                    {thread.latest_message?.body ?? "まだメッセージはありません"}
                  </p>
                </div>

                {thread.unread_messages_count > 0 && (
                  <span className="absolute right-5 bottom-4 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-brand px-2 text-xs font-semibold text-white">
                    {thread.unread_messages_count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
