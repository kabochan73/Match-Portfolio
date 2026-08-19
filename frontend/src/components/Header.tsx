"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { CompanyHeader } from "@/components/company/CompanyHeader";
import { SeekerHeader } from "@/components/seeker/SeekerHeader";

// 全ページ共通のHeader。/jobsや/companies/[id]など未ログインでも見られる公開ページ
// ((public)ルートグループ)専用のCC。認証Cookieはブラウザ側にしかないため、
// ここでseeker/companyそれぞれのプロフィール取得を試みてログイン状態を判定する
// (401はログインしていないだけの正常系なのでretryはしない)。
// ログイン中の場合は、公開ページに来てもダッシュボードと同じヘッダー(SeekerHeader/CompanyHeader)を
// そのまま表示し、マイページ等への導線が消えないようにする
export function Header() {
  const seekerProfileQuery = useQuery({
    queryKey: ["seeker", "profile"],
    queryFn: () => apiFetch("/api/profile"),
    retry: false,
  });
  const companyProfileQuery = useQuery({
    queryKey: ["company", "profile"],
    queryFn: () => apiFetch("/api/company/profile"),
    retry: false,
  });

  if (seekerProfileQuery.isSuccess) {
    return <SeekerHeader />;
  }

  if (companyProfileQuery.isSuccess) {
    return <CompanyHeader />;
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold text-brand">
          Tech Match
        </Link>

        <nav className="flex items-center gap-6 text-sm  text-zinc-700 font-bold">
          <Link
            href="/jobs"
            className="hidden items-center gap-1 hover:text-zinc-900 sm:flex"
          >
            <Search size={20} />
            求人を探す
          </Link>
          <Link href="/seeker/login" className="hover:text-zinc-900">
            求職者ログイン
          </Link>
          <Link
            href="/seeker/register"
            className="rounded-md bg-brand px-4 py-2 text-white transition-colors hover:bg-sky-600"
          >
            新規登録
          </Link>
          <Link href="/company/login" className="hover:text-zinc-900">
            企業ログイン
          </Link>
        </nav>
      </div>
    </header>
  );
}
