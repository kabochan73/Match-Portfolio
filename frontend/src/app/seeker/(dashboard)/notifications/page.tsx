"use client";

// CC。Sanctumのcookie認証データをTanStack Queryで取得する単発の一覧表示のみのページなので、
// 再利用の予定もなくpage.tsx自体をCCにする
import Link from "next/link";
import {
  NOTIFICATION_TYPE,
  type AppNotification,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/seeker/useNotifications";

// 通知の種類ごとに、本文とクリック時の遷移先を組み立てる
function describe(notification: AppNotification): {
  text: string;
  href: string;
} {
  if (notification.type === NOTIFICATION_TYPE.LikeMatched) {
    const data = notification.data as {
      like_id: number;
      job_posting_title: string;
      company_name: string;
    };
    return {
      text: `「${data.job_posting_title}」への応募がマッチしました(${data.company_name})`,
      href: `/seeker/messages/${data.like_id}`,
    };
  }

  const data = notification.data as { like_id: number; body: string };
  return {
    text: `新着メッセージ: ${data.body}`,
    href: `/seeker/messages/${data.like_id}`,
  };
}

export default function Page() {
  const { data: notifications, isLoading, isError } = useNotifications();
  const markReadMutation = useMarkNotificationRead();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="pb-8 text-2xl font-bold text-zinc-900">通知</h1>

      {isLoading && (
        <p className="px-4 py-12 text-center text-sm text-zinc-500">
          読み込み中...
        </p>
      )}

      {isError && (
        <p role="alert" className="px-4 py-12 text-center text-sm text-red-600">
          通知の取得に失敗しました。
        </p>
      )}

      {notifications && notifications.length === 0 && (
        <p className="px-4 py-12 text-center text-sm text-zinc-500">
          通知はまだありません。
        </p>
      )}

      {notifications && notifications.length > 0 && (
        <ul className="space-y-3">
          {notifications.map((notification) => {
            const { text, href } = describe(notification);
            const isUnread = notification.read_at === null;

            return (
              <li key={notification.id}>
                <Link
                  href={href}
                  onClick={() => {
                    if (isUnread) {
                      markReadMutation.mutate(notification.id);
                    }
                  }}
                  className={`flex items-start gap-3 border p-4 transition hover:border-sky-300 hover:shadow-sm ${
                    isUnread ? "border-sky-200 bg-sky-50" : "border-zinc-200"
                  }`}
                >
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${isUnread ? "bg-brand" : "bg-transparent"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${isUnread ? "font-semibold text-zinc-900" : "text-zinc-600"}`}
                    >
                      {text}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {notification.created_at.slice(0, 16).replace("T", " ")}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
