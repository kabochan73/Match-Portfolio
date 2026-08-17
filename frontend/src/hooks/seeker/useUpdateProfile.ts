"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import type { SeekerProfile } from "@/hooks/seeker/useProfile";

// バックエンドのUpdateUserProfileRequestと対応する項目のみを検証する。
// 生年月日の18〜60歳ルールのような業務ルールはバックエンド側の判定を正とする(会員登録時と同じ方針)
export const updateProfileSchema = z.object({
  name: z.string().min(1, "氏名を入力してください").max(255),
  comment: z.string().max(200, "200文字以内で入力してください").optional(),
  portfolioUrl: z
    .union([z.url("URLの形式で入力してください"), z.literal("")])
    .optional(),
  birthDate: z.string().min(1, "生年月日を入力してください"),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UpdateProfileValues) =>
      apiFetch<SeekerProfile>("/api/profile", {
        method: "PUT",
        body: {
          name: values.name,
          comment: values.comment || null,
          portfolio_url: values.portfolioUrl || null,
          birth_date: values.birthDate,
        },
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["seeker", "profile"], updated);
    },
  });
}
