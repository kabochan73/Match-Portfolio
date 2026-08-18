"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

// バックエンドのlikes.like_typeのCHECK制約と対応する区分
export type LikeType = "standard" | "super";

export const likeTypeLabels: Record<LikeType, string> = {
  standard: "いいね",
  super: "スーパーいいね",
};

// バックエンドのLikeモデルのJSON表現
export type Like = {
  id: number;
  job_posting_id: number;
  like_type: LikeType;
  status: "applied" | "matched" | "expired";
  motivation: string;
  applied_at: string;
  response_deadline: string;
};

export const applySchema = z.object({
  likeType: z.enum(["standard", "super"], {
    error: "いいねの種類を選択してください",
  }),
  motivation: z.string().min(1, "志望動機を入力してください"),
});

export type ApplyValues = z.infer<typeof applySchema>;

// 応募状況一覧ページ(今後実装)がこのキーをinvalidateして再取得できるよう、
// いいね作成時点で先にキーだけ定義しておく
export const likesQueryKey = ["seeker", "likes"] as const;

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
    },
  });
}
