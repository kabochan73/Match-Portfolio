import type { ReactNode } from "react";

// フォームの「ラベル + 入力欄 + エラーメッセージ」の枠だけを共通化する純粋な表示コンポーネント。
// データ取得は行わず、呼び出し側からラベル・エラー文言・入力要素本体(input/textarea/select)を
// 受け取るだけなので、SC/CC区分は呼び出し側次第(AvatarView.tsxと同じ方針)
export function FormField({
  htmlFor,
  label,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// input/textarea/selectのclassNameを組み立てる。accentはactorごとの既存の色分けを維持するため必須にしている
// (seeker/公開ページ = brand、company = emerald-500。デフォルト値を設けると片方を書き忘れたときに
// 気づけずbrand色が紛れ込むため、あえて必須にしている)
export function formInputClass(accent: "brand" | "emerald") {
  const ring =
    accent === "emerald"
      ? "focus:border-emerald-500 focus:ring-emerald-500"
      : "focus:border-brand focus:ring-brand";
  return `mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 ${ring}`;
}
