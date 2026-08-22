"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  FileText,
  LogOut,
  MessageCircle,
  Search,
  User,
} from "lucide-react";
import { useLogout } from "@/hooks/seeker/auth/useLogout";
import { useNotifications } from "@/hooks/seeker/useNotifications";

const navItems = [
  { href: "/jobs", label: "求人を探す", icon: Search },
  { href: "/seeker/applications", label: "応募一覧", icon: FileText },
  { href: "/seeker/messages", label: "メッセージ", icon: MessageCircle },
  { href: "/seeker/notifications", label: "通知", icon: Bell },
  { href: "/seeker/mypage", label: "マイページ", icon: User },
] as const;

// 求職者ダッシュボード((dashboard)ルートグループ)専用のヘッダー。
// ログイン中であることが前提のセクションなので、全ページ共通のHeaderとは分けて
// 求人検索・応募一覧・メッセージ・通知・マイページへの導線とログアウトを持たせる
export function SeekerHeader() {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  // ヘッダーは全ページ共通で常時マウントされるため、通知バッジの未読件数もここで取得する。
  // 通知一覧ページと同じクエリキーなのでTanStack Query側でリクエストが共有される
  const { data: notifications } = useNotifications();
  const unreadCount =
    notifications?.filter((notification) => notification.read_at === null)
      .length ?? 0;

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/seeker/mypage" className="text-2xl font-bold text-brand">
          Tech Match
        </Link>

        <nav className="flex items-center gap-5 text-sm font-bold text-zinc-700">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative hidden items-center gap-1 sm:flex ${
                  isActive ? "text-brand" : "hover:text-zinc-900"
                }`}
              >
                <Icon size={20} />
                {label}
                {href === "/seeker/notifications" && unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-1 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={20} />
            ログアウト
          </button>
        </nav>
      </div>
    </header>
  );
}
