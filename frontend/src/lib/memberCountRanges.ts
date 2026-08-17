// バックエンドのcompanies.member_count_rangeのCHECK制約と対応する区分。
// company(CC)・公開ページ(SC)の両方から参照するため、actorに紐づくhooks/では
// なくここに置く("use client"を持たないプレーンなデータ)。
//
// "use client"なファイルが持つ実行時の値(コンポーネントに限らず定数オブジェクトも含む)を
// Server Componentから直接importすると、クライアント参照として扱われ中身が正しく解決されない
// ことがある(実際に/companies/[id]でメンバー数ラベルが空表示になるバグとして発現した)。
// 型だけでなく値もこの非"use client"モジュールに置くことで、SC/CCどちらからでも安全に使える
export type MemberCountRange =
  "1_10" | "11_50" | "51_100" | "101_300" | "301_plus";

export const memberCountRangeLabels: Record<MemberCountRange, string> = {
  "1_10": "1〜10人",
  "11_50": "11〜50人",
  "51_100": "51〜100人",
  "101_300": "101〜300人",
  "301_plus": "301人以上",
};
