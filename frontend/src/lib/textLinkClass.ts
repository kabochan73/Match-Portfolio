// ダッシュボード内の「〜に戻る」「編集する」等、サブアクション用テキストリンクの共通クラス。
// 色は求職者側(brand)・企業側(emerald)で使い分ける(buttonClassと同じ方針)。
// shrink-0は隣にバッジ等がある行で潰れないようにするためのもので、単独配置でも無害。
// inline-flex items-center gap-1は「戻る」系リンクのChevronLeftアイコン(public/BackButtonと
// 同じlucide-react製)と文字を並べるためのもので、アイコンなしのリンクでも無害
export function textLinkClass(accent: "brand" | "emerald") {
  return `inline-flex shrink-0 items-center gap-1 text-sm font-semibold hover:underline ${
    accent === "emerald" ? "text-emerald-600" : "text-brand"
  }`;
}
