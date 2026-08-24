"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Certification } from "@/hooks/seeker/useCertifications";
import type { Education } from "@/hooks/seeker/useEducations";
import type { WorkExperience } from "@/hooks/seeker/useWorkExperiences";

// seeker側useLikes.tsと同じ定義だが、actorをまたいだimportはしない方針のため
// ここで独立して定義する(バックエンドのlikes.like_type/statusのCHECK制約と対応)
export type LikeType = "standard" | "super";

export const likeTypeLabels: Record<LikeType, string> = {
  standard: "いいね",
  super: "スーパーいいね",
};

export type LikeStatus = "applied" | "matched" | "expired";

export const likeStatusLabels: Record<LikeStatus, string> = {
  applied: "選考中(反応待ち)",
  matched: "マッチ成立",
  expired: "マッチ不成立",
};

// バックエンドのLikeモデルのJSON表現(userを含まない基本形。matchエンドポイントの戻り値と対応)
export type Like = {
  id: number;
  user_id: number;
  job_posting_id: number;
  like_type: LikeType;
  motivation: string;
  status: LikeStatus;
  applied_at: string;
  response_deadline: string;
  company_responded_at: string | null;
};

// 応募者一覧で使う、求職者情報を絞ったサマリー
// (バックエンドのCompany\LikeController@indexがwith('user:id,name,avatar_path,birth_date')で返す形と対応。
// avatar_pathはUserモデル側でHidden、代わりにavatar_urlがAppendsされる)
export type ApplicantSummary = Like & {
  user: {
    id: number;
    name: string;
    avatar_url: string | null;
    birth_date: string;
  };
};

// 応募者詳細。Company\LikeController@showがログインID(email)を除いた列に絞った上で
// 職歴・学歴・資格までloadして返す形と対応(型定義自体はsrc/components/seeker/配下の
// 表示コンポーネントにそのまま渡せるよう、対応するseeker側の型をtype-onlyでimportして使う)
export type ApplicantDetail = Like & {
  user: {
    id: number;
    name: string;
    avatar_url: string | null;
    birth_date: string;
    comment: string | null;
    portfolio_url: string | null;
    work_experiences: WorkExperience[];
    educations: Education[];
    certifications: Certification[];
  };
};

export function applicantsQueryKey(jobPostingId: number) {
  return ["company", "jobPostings", jobPostingId, "likes"] as const;
}

function applicantQueryKey(likeId: number) {
  return ["company", "likes", likeId] as const;
}

// 求人ごとの応募者一覧(バックエンドが求人単位のエンドポイントしか提供していないため、
// 全求人横断の一覧はフロント側で求人セレクタを設けて対応する)
export function useApplicants(jobPostingId: number) {
  return useQuery({
    queryKey: applicantsQueryKey(jobPostingId),
    queryFn: () =>
      apiFetch<ApplicantSummary[]>(
        `/api/company/job-postings/${jobPostingId}/likes`,
      ),
    enabled: jobPostingId > 0,
  });
}

export function useApplicant(likeId: number) {
  return useQuery({
    queryKey: applicantQueryKey(likeId),
    queryFn: () => apiFetch<ApplicantDetail>(`/api/company/likes/${likeId}`),
  });
}

// 「気になる」。応募者一覧・詳細のどちらから呼ばれるか分からないため、
// 求人IDを問わず company/jobPostings 配下のキーをまとめてinvalidateする
export function useMatchApplicant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (likeId: number) =>
      apiFetch<Like>(`/api/company/likes/${likeId}/match`, {
        method: "PATCH",
      }),
    onSuccess: (_updated, likeId) => {
      queryClient.invalidateQueries({ queryKey: applicantQueryKey(likeId) });
      queryClient.invalidateQueries({ queryKey: ["company", "jobPostings"] });
    },
  });
}

// 応募者一覧からの非表示。message-threadsのhideと同じcompany_hidden_at列を使い回すため、
// マッチ成立済みの応募者を非表示にするとメッセージスレッド一覧からも消える。
// 「気になる」と同様、一覧・詳細どちらから呼ばれるか分からないため、
// company/jobPostings配下に加えmessageThreadsのキーもまとめてinvalidateする
export function useHideApplicant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (likeId: number) =>
      apiFetch<void>(`/api/company/likes/${likeId}/hide`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", "jobPostings"] });
      queryClient.invalidateQueries({
        queryKey: ["company", "messageThreads"],
      });
    },
  });
}
