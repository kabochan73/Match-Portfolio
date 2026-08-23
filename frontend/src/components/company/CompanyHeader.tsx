"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Briefcase,
  CreditCard,
  LogOut,
  MessageCircle,
  Search,
  User,
  Users,
} from "lucide-react";
import { useLogout } from "@/hooks/company/auth/useLogout";
import { useNotifications } from "@/hooks/company/useNotifications";

const navItems = [
  { href: "/jobs", label: "求人を探す", icon: Search },
  { href: "/company/job-postings", label: "求人管理", icon: Briefcase },
  { href: "/company/applicants", label: "応募者一覧", icon: Users },
  { href: "/company/messages", label: "メッセージ", icon: MessageCircle },
  { href: "/company/notifications", label: "通知", icon: Bell },
  { href: "/company/billing", label: "課金", icon: CreditCard },
  { href: "/company/profile", label: "マイページ", icon: User },
] as const;

// 企業ダッシュボード((dashboard)ルートグループ)専用のヘッダー。
// ログイン中であることが前提のセクションなので、全ページ共通のHeaderとは分けて
// 求人検索・求人管理・応募者・メッセージ・通知・課金・マイページへの導線とログアウトを持たせる
// (seekerのSeekerHeaderと同じ方針)
export function CompanyHeader() {
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
        <Link
          href="/company/profile"
          className="text-2xl font-bold text-emerald-600"
        >
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
                  isActive ? "text-emerald-600" : "hover:text-zinc-900"
                }`}
              >
                <Icon size={20} />
                {label}
                {href === "/company/notifications" && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
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
