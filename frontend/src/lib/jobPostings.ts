import { publicFetch } from "@/lib/api/publicFetch";
import { PREFECTURES, type Prefecture } from "@/lib/prefectures";

// company側のuseJobPostings.tsと同じ定義だが、actor(company認証)をまたいだ
// importはしない方針のためここで独立して定義する
export type EmploymentType = "full_time" | "part_time" | "contract";

export const employmentTypeLabels: Record<EmploymentType, string> = {
  full_time: "正社員",
  contract: "契約社員",
  part_time: "アルバイト",
};

export type JobPostingPrefecture = Prefecture | "リモート";

export const JOB_POSTING_PREFECTURES: readonly JobPostingPrefecture[] = [
  ...PREFECTURES,
  "リモート",
];

// 公開求人一覧カードで使う、company側の情報を絞ったサマリー
export type PublicCompanySummary = {
  id: number;
  name: string;
  avatar_url: string | null;
  prefecture: Prefecture | null;
};

export type PublicJobPostingListItem = {
  id: number;
  title: string;
  employment_type: EmploymentType;
  prefecture: JobPostingPrefecture;
  salary_min: number;
  salary_max: number;
  likes_count: number;
  company: PublicCompanySummary;
};

// 求人詳細ではcompanyの基本プロフィール一式(company-profile/BasicProfileView等が
// 期待する形)をそのまま含む
export type PublicJobPostingDetail = {
  id: number;
  title: string;
  description: string;
  desired_candidate: string;
  employment_type: EmploymentType;
  prefecture: JobPostingPrefecture;
  salary_min: number;
  salary_max: number;
  likes_count: number;
  published_at: string | null;
  company: {
    id: number;
    name: string;
    description: string | null;
    phone_number: string | null;
    prefecture: Prefecture | null;
    address_line: string | null;
    founded_year: number | null;
    member_count_range: string | null;
    website_url: string | null;
    avatar_url: string | null;
    cover_image_url: string | null;
  };
};

export type JobPostingSearchParams = {
  keyword?: string;
  prefecture?: string;
  employment_type?: string;
};

// /jobsはsearchParamsで絞り込むため常に動的レンダリング(キャッシュしない)
export function searchJobPostings(params: JobPostingSearchParams) {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.prefecture) query.set("prefecture", params.prefecture);
  if (params.employment_type)
    query.set("employment_type", params.employment_type);

  const queryString = query.toString();
  return publicFetch<PublicJobPostingListItem[]>(
    `/api/job-postings${queryString ? `?${queryString}` : ""}`,
    { cache: "no-store" },
  );
}

// /jobs/[id]はISR対象。2時間を上限に再検証する(オンデマンド再検証は未実装、将来追加予定)
export function getJobPosting(id: string) {
  return publicFetch<PublicJobPostingDetail>(`/api/job-postings/${id}`, {
    next: { revalidate: 7200 },
  });
}
