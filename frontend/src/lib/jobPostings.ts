import { publicFetch } from "@/lib/api/publicFetch";
import type { MemberCountRange } from "@/lib/memberCountRanges";
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
  job_posting_images: { id: number; url: string; position: number }[];
};

// 求人詳細ではcompanyの基本プロフィール一式(components/company/profile/BasicProfileView等が
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
  job_posting_images: { id: number; url: string; position: number }[];
  company: {
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
  };
};

export type JobPostingSearchParams = {
  keyword?: string;
  prefecture?: string;
  employment_type?: string;
  page?: number;
};

// バックエンドのpaginate(30)と対応する、一覧のページネーション結果
// (Laravelのデフォルトのページネーション形式のうち、フロントで使う項目だけを抜粋)
export type PaginatedJobPostings = {
  data: PublicJobPostingListItem[];
  current_page: number;
  last_page: number;
  total: number;
};

// /jobsはsearchParamsで絞り込むため常に動的レンダリング(キャッシュしない)
export function searchJobPostings(params: JobPostingSearchParams) {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.prefecture) query.set("prefecture", params.prefecture);
  if (params.employment_type)
    query.set("employment_type", params.employment_type);
  if (params.page && params.page > 1) query.set("page", String(params.page));

  const queryString = query.toString();
  return publicFetch<PaginatedJobPostings>(
    `/api/job-postings${queryString ? `?${queryString}` : ""}`,
    { cache: "no-store" },
  );
}

// /companies/[id]の「掲載中の求人」欄向け。/jobsの検索(no-store)と違いISR対象のページから
// 呼ぶため、company-${id}タグで会社ページ本体(getCompany)と同じ再検証と対応させる
// (企業側の求人の公開・非公開・削除時にバックエンドがこのタグをrevalidateする)
export function getCompanyJobPostings(companyId: string) {
  return publicFetch<PaginatedJobPostings>(
    `/api/job-postings?company_id=${companyId}`,
    { next: { revalidate: 7200, tags: [`company-${companyId}`] } },
  );
}

// /jobs/[id]はISR対象。2時間を上限に再検証する。オンデマンド再検証は、求人自体の変更
// (Company\JobPostingController・JobPostingImageController)、および埋め込んで表示している
// 企業プロフィールの変更(Company\ProfileController・AvatarController)の両方でトリガーされる
export function getJobPosting(id: string) {
  return publicFetch<PublicJobPostingDetail>(`/api/job-postings/${id}`, {
    // タグはバックエンドの求人更新エンドポイントが/api/revalidateを叩く際の
    // オンデマンド再検証と対応させる(revalidate: 7200は失敗時のフォールバックの上限)
    next: { revalidate: 7200, tags: [`job-posting-${id}`] },
  });
}
