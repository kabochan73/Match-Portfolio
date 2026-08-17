import { publicFetch } from "@/lib/api/publicFetch";
import type { MemberCountRange } from "@/lib/memberCountRanges";
import type { Prefecture } from "@/lib/prefectures";

// バックエンドのCompany::publicColumns()と対応する、公開向けの企業プロフィール
// (email等の非公開項目を含まない)
export type PublicCompanyProfile = {
  id: number;
  name: string;
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

// /companies/[id]はISR対象。/jobs/[id]と同じ理由で2時間を上限に再検証する
export function getCompany(id: string) {
  return publicFetch<PublicCompanyProfile>(`/api/companies/${id}`, {
    next: { revalidate: 7200 },
  });
}
