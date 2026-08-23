// ステータスバッジ・ピルの共通形状。色は状態ごとに異なる(呼び出し側のRecord<Status, string>
// マップから来る)ため、ここでは形状(角丸・padding・文字サイズ)だけを持つ。
// text-sm/text-xsが混在していたのをtext-xsに強制統一している(buttonClassと同じ方針)。
// 色・位置(absolute/ml-auto等)は呼び出し側で `${badgeClass} ${色}` のように足す
export const badgeClass = "rounded-full px-3 py-1 text-xs font-semibold";
