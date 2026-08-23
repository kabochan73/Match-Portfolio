// ボタン系要素(button/ボタン然としたLink/ファイル選択label)のclassNameを組み立てる。
// padding/font-sizeはpx-4 py-2 text-smに強制統一している(元々px-4 py-2.5やpx-6 py-2.5、
// text-xs等がばらついていたが、大きさを揃えて共通化する方針にした)。w-full/shrink-0のような
// レイアウト都合の追加クラスは呼び出し側で `${buttonClass(...)} w-full` のように足す
export function buttonClass(
  variant: "primary" | "outline",
  accent: "brand" | "emerald",
): string;
export function buttonClass(variant: "secondary" | "danger"): string;
export function buttonClass(
  variant: "primary" | "outline" | "secondary" | "danger",
  accent?: "brand" | "emerald",
): string {
  const base =
    "rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

  if (variant === "secondary") {
    return `${base} border border-zinc-300 text-zinc-700 hover:bg-zinc-50`;
  }
  if (variant === "danger") {
    return `${base} border border-red-300 text-red-600 hover:bg-red-50`;
  }
  if (variant === "primary") {
    return accent === "emerald"
      ? `${base} bg-emerald-500 text-white hover:bg-emerald-600`
      : `${base} bg-brand text-white hover:bg-sky-600`;
  }
  // outline
  return accent === "emerald"
    ? `${base} border border-emerald-500 text-emerald-600 hover:bg-emerald-50`
    : `${base} border border-brand text-brand hover:bg-brand-light`;
}
