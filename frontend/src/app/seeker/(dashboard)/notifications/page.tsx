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

  if (isLoading) {
    return <p>読み込み中...</p>;
  }

  if (isError || !notifications) {
    return <p role="alert">通知の取得に失敗しました。</p>;
  }

  return (
    <>
      <h1>通知</h1>

      {notifications.length === 0 ? (
        <p>通知はまだありません。</p>
      ) : (
        <ul>
          {notifications.map((notification) => {
            const { text, href } = describe(notification);

            return (
              <li key={notification.id}>
                {notification.read_at === null && <strong>未読 </strong>}
                <Link
                  href={href}
                  onClick={() => {
                    if (notification.read_at === null) {
                      markReadMutation.mutate(notification.id);
                    }
                  }}
                >
                  {text}
                </Link>
                <p>{notification.created_at.slice(0, 16).replace("T", " ")}</p>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
