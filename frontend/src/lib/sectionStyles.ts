// ページ内の見出し・セクション区切りの共通クラス。JSXを持たない純粋なクラス文字列なので、
// コンポーネントではなくlib配下に置く(SC/CCどちらからでもimportして安全)

// h1/h2の見出し(auth系ページタイトル、マイページ・応募者詳細等のセクション見出し)。
// text-center/mb-4/mt-2等の追加クラスは呼び出し側で `${sectionHeadingClass} mb-4` のように足す
export const sectionHeadingClass = "text-xl font-bold text-zinc-900";

// セクション間の区切り線。zinc-400は自分のダッシュボード(マイページ・応募者詳細等)、
// zinc-200は公開ページ・プレビュー(求人詳細/企業詳細/求人プレビュー)向けで、
// 意図的に色を使い分けている(既存の使われ方に合わせたデフォルトはdefault=zinc-400)
export function sectionDividerClass(tone: "default" | "subtle" = "default") {
  return tone === "subtle"
    ? "border-t border-zinc-200 py-8"
    : "border-t border-zinc-400 py-8";
}
