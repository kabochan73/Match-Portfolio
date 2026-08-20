"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { MemberCountRange } from "@/lib/memberCountRanges";
import type { Prefecture } from "@/lib/prefectures";

export type { Prefecture } from "@/lib/prefectures";
export { PREFECTURES } from "@/lib/prefectures";
export type { MemberCountRange } from "@/lib/memberCountRanges";
export { memberCountRangeLabels } from "@/lib/memberCountRanges";

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
    // 未ログイン時の401は「ログインしていないだけ」の正常系であり、リトライしても結果は
    // 変わらない。Header.tsxの同じクエリキーへの問い合わせと挙動を揃える意味でも明示しておく
    retry: false,
  });
}
