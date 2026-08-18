import Link from "next/link";

// 全ページ共通のヘッダー。認証Cookieはサーバーコンポーネントから読めないため、
// ログイン状態に応じた出し分けはせず、常に同じ導線(ログイン/新規登録リンク)を表示する
export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-brand">
          Tech Match
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600">
          <Link href="/jobs" className="hidden hover:text-zinc-900 sm:block">
            求人を探す
          </Link>
          <Link href="/seeker/login" className="hover:text-zinc-900">
            求職者ログイン
          </Link>
          <Link href="/company/login" className="hover:text-zinc-900">
            企業の方はこちら
          </Link>
          <Link
            href="/seeker/register"
            className="rounded-full bg-brand px-4 py-2 text-white transition-colors hover:bg-sky-600"
          >
            会員登録
          </Link>
        </nav>
      </div>
    </header>
  );
}
