"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import type { EmploymentType, JobPostingPrefecture } from "@/lib/jobPostings";

// バックエンドのlikes.like_typeのCHECK制約と対応する区分
export type LikeType = "standard" | "super";

export const likeTypeLabels: Record<LikeType, string> = {
  standard: "いいね",
  super: "スーパーいいね",
};

// バックエンドのlikes.statusのCHECK制約と対応するマッチング状態
export type LikeStatus = "applied" | "matched" | "expired";

export const likeStatusLabels: Record<LikeStatus, string> = {
  applied: "選考中(企業の反応待ち)",
  matched: "マッチ成立",
  expired: "マッチ不成立",
};

// 応募状況一覧で表示する、応募先求人の情報を絞ったサマリー
// (バックエンドのLikeController@indexが返す形と対応。/jobsの一覧カードと同じ見た目にするため
// 会社名・給与・画像も含む)
export type LikeJobPostingSummary = {
  id: number;
  company_id: number;
  title: string;
  employment_type: EmploymentType;
  prefecture: JobPostingPrefecture;
  salary_min: number;
  salary_max: number;
  status: "draft" | "published" | "unpublished" | "closed";
  company: { id: number; name: string };
  job_posting_images: { id: number; url: string; position: number }[];
};

// バックエンドのLikeモデルのJSON表現
export type Like = {
  id: number;
  job_posting_id: number;
  like_type: LikeType;
  status: LikeStatus;
  motivation: string;
  applied_at: string;
  response_deadline: string;
  job_posting: LikeJobPostingSummary;
};

export const applySchema = z.object({
  likeType: z.enum(["standard", "super"], {
    error: "いいねの種類を選択してください",
  }),
  motivation: z.string().min(1, "志望動機を入力してください"),
});

export type ApplyValues = z.infer<typeof applySchema>;

export const likesQueryKey = ["seeker", "likes"] as const;

// 応募状況一覧。新しい応募が先頭に来る順(バックエンド側でapplied_at降順)で返る
export function useLikes() {
  return useQuery({
    queryKey: likesQueryKey,
    queryFn: () => apiFetch<Like[]>("/api/likes"),
  });
}

// 種別ごとの今月の残りいいね数(バックエンドのLikeController@remainingと対応)
export type RemainingLikeCount = {
  limit: number;
  used: number;
  remaining: number;
};

export type LikesRemaining = Record<LikeType, RemainingLikeCount>;

export const likesRemainingQueryKey = ["seeker", "likes", "remaining"] as const;

export function useLikesRemaining(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: likesRemainingQueryKey,
    queryFn: () => apiFetch<LikesRemaining>("/api/likes/remaining"),
    enabled: options?.enabled,
  });
}

// 応募状況一覧からの非表示。求人が非公開/募集終了になった応募のみ対象(バックエンド側で
// 公開中の求人への応募は422で拒否する)
export function useHideLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (likeId: number) =>
      apiFetch<void>(`/api/likes/${likeId}/hide`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: likesQueryKey });
    },
  });
}

export function useCreateLike(jobPostingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ApplyValues) =>
      apiFetch<Like>("/api/likes", {
        method: "POST",
        body: {
          job_posting_id: jobPostingId,
          like_type: values.likeType,
          motivation: values.motivation,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: likesQueryKey });
      queryClient.invalidateQueries({ queryKey: likesRemainingQueryKey });
    },
  });
}
