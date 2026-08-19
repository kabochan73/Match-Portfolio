"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, FileText, LogOut, MessageCircle, User } from "lucide-react";
import { useLogout } from "@/hooks/seeker/auth/useLogout";

const navItems = [
  { href: "/seeker/applications", label: "応募一覧", icon: FileText },
  { href: "/seeker/messages", label: "メッセージ", icon: MessageCircle },
  { href: "/seeker/notifications", label: "通知", icon: Bell },
  { href: "/seeker/mypage", label: "マイページ", icon: User },
] as const;

// 求職者ダッシュボード((dashboard)ルートグループ)専用のヘッダー。
// ログイン中であることが前提のセクションなので、全ページ共通のHeaderとは分けて
// マイページ・応募一覧・メッセージ・通知への導線とログアウトを持たせる
export function SeekerHeader() {
  const pathname = usePathname();
  const logoutMutation = useLogout();

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
                className={`hidden items-center gap-1 sm:flex ${
                  isActive ? "text-brand" : "hover:text-zinc-900"
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
