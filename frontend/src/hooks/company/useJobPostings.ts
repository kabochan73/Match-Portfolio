"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import { PREFECTURES, type Prefecture } from "@/hooks/company/useProfile";

// バックエンドのwork_experiences/job_postings共通のemployment_type区分。
// seeker側のuseWorkExperiences.tsと同じ定義だが、actorをまたいだimportはしない方針のため
// ここで独立して定義する
export type EmploymentType = "full_time" | "part_time" | "contract";

export const employmentTypeLabels: Record<EmploymentType, string> = {
  full_time: "正社員",
  contract: "契約社員",
  part_time: "アルバイト",
};

// 求人の勤務地は、企業所在地用の47都道府県(Prefecture)に「リモート」を加えたもの
export type JobPostingPrefecture = Prefecture | "リモート";

export const JOB_POSTING_PREFECTURES: readonly JobPostingPrefecture[] = [
  ...PREFECTURES,
  "リモート",
];

// バックエンドのjob_postings.statusのCHECK制約と対応する公開状態
export type JobPostingStatus = "draft" | "published" | "unpublished" | "closed";

export const jobPostingStatusLabels: Record<JobPostingStatus, string> = {
  draft: "下書き",
  published: "公開中",
  // 企業が直接この状態にはできない(Stripeの支払い失敗webhookから自動設定される)
  unpublished: "非公開(支払い未了)",
  closed: "募集終了",
};

// バックエンドのJobPostingモデルのJSON表現。likes_countはindex/showで
// withCount('likes')されている場合のみ含まれる(応募数=いいね数)
export type JobPosting = {
  id: number;
  title: string;
  description: string;
  desired_candidate: string;
  employment_type: EmploymentType;
  prefecture: JobPostingPrefecture;
  salary_min: number;
  salary_max: number;
  status: JobPostingStatus;
  published_at: string | null;
  likes_count?: number;
};

// 作成・更新の両方で使うフォームのスキーマ(バックエンドのJobPostingRequestが
// store/updateで共用なのと同じ理由)。salary_max >= salary_minの業務ルールは
// 会員登録時の生年月日ルールと同じ方針でクライアント側では重複させず、
// サーバーの422エラーをそのまま表示する
export const jobPostingSchema = z.object({
  title: z.string().min(1, "求人タイトルを入力してください").max(255),
  description: z.string().min(1, "職務内容を入力してください"),
  desiredCandidate: z.string().min(1, "求める人材像を入力してください"),
  employmentType: z.enum(["full_time", "part_time", "contract"], {
    error: "雇用形態を選択してください",
  }),
  prefecture: z.string().min(1, "勤務地を選択してください"),
  salaryMin: z.string().min(1, "月給(下限)を入力してください"),
  salaryMax: z.string().min(1, "月給(上限)を入力してください"),
});

export type JobPostingValues = z.infer<typeof jobPostingSchema>;

// 一覧・個別取得・作成・更新・削除・公開状態変更の全フックで共有するクエリキー
export const jobPostingsQueryKey = ["company", "jobPostings"] as const;

function jobPostingQueryKey(id: number) {
  return ["company", "jobPostings", id] as const;
}

export function useJobPostings() {
  return useQuery({
    queryKey: jobPostingsQueryKey,
    queryFn: () => apiFetch<JobPosting[]>("/api/company/job-postings"),
  });
}

export function useJobPosting(id: number) {
  return useQuery({
    queryKey: jobPostingQueryKey(id),
    queryFn: () => apiFetch<JobPosting>(`/api/company/job-postings/${id}`),
  });
}

function toRequestBody(values: JobPostingValues) {
  return {
    title: values.title,
    description: values.description,
    desired_candidate: values.desiredCandidate,
    employment_type: values.employmentType,
    prefecture: values.prefecture,
    salary_min: Number(values.salaryMin),
    salary_max: Number(values.salaryMax),
  };
}

export function useCreateJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: JobPostingValues) =>
      apiFetch<JobPosting>("/api/company/job-postings", {
        method: "POST",
        body: toRequestBody(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobPostingsQueryKey });
    },
  });
}

export function useUpdateJobPosting(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: JobPostingValues) =>
      apiFetch<JobPosting>(`/api/company/job-postings/${id}`, {
        method: "PUT",
        body: toRequestBody(values),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(jobPostingQueryKey(id), updated);
      queryClient.invalidateQueries({ queryKey: jobPostingsQueryKey });
    },
  });
}

export function useDeleteJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/company/job-postings/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobPostingsQueryKey });
    },
  });
}

function useStatusTransition(action: "publish" | "unpublish" | "close") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<JobPosting>(`/api/company/job-postings/${id}/${action}`, {
        method: "PATCH",
      }),
    onSuccess: (updated, id) => {
      queryClient.setQueryData(jobPostingQueryKey(id), updated);
      queryClient.invalidateQueries({ queryKey: jobPostingsQueryKey });
    },
  });
}

export function usePublishJobPosting() {
  return useStatusTransition("publish");
}

export function useUnpublishJobPosting() {
  return useStatusTransition("unpublish");
}

export function useCloseJobPosting() {
  return useStatusTransition("close");
}
