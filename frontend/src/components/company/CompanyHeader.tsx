"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Briefcase,
  LogOut,
  MessageCircle,
  Search,
  User,
  Users,
} from "lucide-react";
import { useLogout } from "@/hooks/company/auth/useLogout";

const navItems = [
  { href: "/jobs", label: "求人を探す", icon: Search },
  { href: "/company/job-postings", label: "求人管理", icon: Briefcase },
  { href: "/company/applicants", label: "応募者一覧", icon: Users },
  { href: "/company/messages", label: "メッセージ", icon: MessageCircle },
  { href: "/company/notifications", label: "通知", icon: Bell },
  { href: "/company/profile", label: "マイページ", icon: User },
] as const;

// 企業ダッシュボード((dashboard)ルートグループ)専用のヘッダー。
// ログイン中であることが前提のセクションなので、全ページ共通のHeaderとは分けて
// 求人検索・求人管理・応募者・メッセージ・通知・マイページへの導線とログアウトを持たせる
// (seekerのSeekerHeaderと同じ方針)。billingは未実装のスタブページのためnavItemsには含めない
export function CompanyHeader() {
  const pathname = usePathname();
  const logoutMutation = useLogout();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/company/profile" className="text-2xl font-bold text-emerald-600">
          Tech Match
        </Link>

        <nav className="flex items-center gap-5 text-sm font-bold text-zinc-700">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`hidden items-center gap-1 sm:flex ${
                  isActive ? "text-emerald-600" : "hover:text-zinc-900"
                }`}
              >
                <Icon size={20} />
                {label}
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
