import Link from "next/link";
import { Search } from "lucide-react";

// 全ページ共通のヘッダー。認証Cookieはサーバーコンポーネントから読めないため、
// ログイン状態に応じた出し分けはせず、常に同じ導線(ログイン/新規登録リンク)を表示する
export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold text-brand">
          Tech Match
        </Link>

        <nav className="flex items-center gap-6 text-sm  text-zinc-600 font-bold">
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
          <Link
            href="/company/register"
            className="rounded-md bg-emerald-500 px-4 py-2 text-white transition-colors hover:bg-emerald-600"
          >
            企業新規登録
          </Link>
        </nav>
      </div>
    </header>
  );
}
