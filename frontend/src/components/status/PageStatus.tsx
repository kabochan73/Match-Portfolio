// ページ全体をTanStack Queryのisloading/isErrorで出し分ける際の定型文言。
// データ取得は行わず、呼び出し側からメッセージを受け取るだけの純粋な表示コンポーネント
// (AvatarView.tsxと同じ方針)。セクション内の小さなローディング/エラー表示(billingページ、
// 職歴・学歴・資格セクションなど)はマージンや余白が異なる別パターンのため対象外にしている
export function PageLoading({
  message = "読み込み中...",
}: {
  message?: string;
}) {
  return (
    <p className="px-4 py-12 text-center text-sm text-zinc-500">{message}</p>
  );
}

export function PageError({ message }: { message: string }) {
  return (
    <p role="alert" className="px-4 py-12 text-center text-sm text-red-600">
      {message}
    </p>
  );
}
