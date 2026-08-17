"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";

// バックエンドのcompanies.prefectureのCHECK制約と対応する区分(値そのものが日本語表記)
export type Prefecture =
  | "北海道"
  | "青森県"
  | "岩手県"
  | "宮城県"
  | "秋田県"
  | "山形県"
  | "福島県"
  | "茨城県"
  | "栃木県"
  | "群馬県"
  | "埼玉県"
  | "千葉県"
  | "東京都"
  | "神奈川県"
  | "新潟県"
  | "富山県"
  | "石川県"
  | "福井県"
  | "山梨県"
  | "長野県"
  | "岐阜県"
  | "静岡県"
  | "愛知県"
  | "三重県"
  | "滋賀県"
  | "京都府"
  | "大阪府"
  | "兵庫県"
  | "奈良県"
  | "和歌山県"
  | "鳥取県"
  | "島根県"
  | "岡山県"
  | "広島県"
  | "山口県"
  | "徳島県"
  | "香川県"
  | "愛媛県"
  | "高知県"
  | "福岡県"
  | "佐賀県"
  | "長崎県"
  | "熊本県"
  | "大分県"
  | "宮崎県"
  | "鹿児島県"
  | "沖縄県";

// <select>の選択肢用。企業プロフィール編集フォームと求人投稿/編集フォームの
// 両方で使う(求人側は「リモート」を追加した配列として使う)
export const PREFECTURES: readonly Prefecture[] = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

// バックエンドのcompanies.member_count_rangeのCHECK制約と対応する区分
export type MemberCountRange =
  "1_10" | "11_50" | "51_100" | "101_300" | "301_plus";

export const memberCountRangeLabels: Record<MemberCountRange, string> = {
  "1_10": "1〜10人",
  "11_50": "11〜50人",
  "51_100": "51〜100人",
  "101_300": "101〜300人",
  "301_plus": "301人以上",
};

// バックエンドのCompanyモデルのJSON表現
export type CompanyProfile = {
  id: number;
  name: string;
  email: string;
  description: string | null;
  phone_number: string | null;
  prefecture: Prefecture | null;
  address_line: string | null;
  founded_year: number | null;
  member_count_range: MemberCountRange | null;
  website_url: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
};

export function useProfile() {
  return useQuery({
    queryKey: ["company", "profile"],
    queryFn: () => apiFetch<CompanyProfile>("/api/company/profile"),
  });
}
