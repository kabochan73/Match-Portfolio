"use client";

// CC。Sanctumのcookie認証データをTanStack Queryで取得する単発の一覧表示のみのページなので、
// 再利用の予定もなくpage.tsx自体をCCにする
import Link from "next/link";
import { useMessageThreads } from "@/hooks/company/useMessageThreads";

export default function Page() {
  const { data: threads, isLoading, isError } = useMessageThreads();

  if (isLoading) {
    return <p>読み込み中...</p>;
  }

  if (isError || !threads) {
    return <p role="alert">メッセージ一覧の取得に失敗しました。</p>;
  }

  return (
    <>
      <h1>メッセージ一覧</h1>

      {threads.length === 0 ? (
        <p>マッチしたメッセージスレッドはまだありません。</p>
      ) : (
        <ul>
          {threads.map((thread) => (
            <li key={thread.id}>
              <p>
                <Link href={`/company/messages/${thread.id}`}>
                  {thread.user.name}
                </Link>
                ({thread.job_posting.title})
                {thread.unread_messages_count > 0 && (
                  <> 未読{thread.unread_messages_count}件</>
                )}
              </p>
              {thread.latest_message && <p>{thread.latest_message.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
