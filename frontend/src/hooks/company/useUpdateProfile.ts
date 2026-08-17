"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import type { CompanyProfile } from "@/hooks/company/useProfile";

// バックエンドのUpdateCompanyProfileRequestと対応する項目のみを検証する。
// prefecture/member_count_rangeは<select>側の選択肢で実質的に制約されるため、
// ここでは厳密なUnion型ではなくstringとして扱い、業務的な妥当性はサーバー側に任せる
export const updateProfileSchema = z.object({
  name: z.string().min(1, "会社名を入力してください").max(255),
  description: z.string().optional(),
  phoneNumber: z.string().max(255).optional(),
  // 空文字は「未選択」を表す(バックエンドにはnullで送る)
  prefecture: z.string().optional(),
  addressLine: z.string().max(255).optional(),
  foundedYear: z.string().optional(),
  memberCountRange: z.string().optional(),
  websiteUrl: z
    .union([z.url("URLの形式で入力してください"), z.literal("")])
    .optional(),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UpdateProfileValues) =>
      apiFetch<CompanyProfile>("/api/company/profile", {
        method: "PUT",
        body: {
          name: values.name,
          description: values.description || null,
          phone_number: values.phoneNumber || null,
          prefecture: values.prefecture || null,
          address_line: values.addressLine || null,
          founded_year: values.foundedYear ? Number(values.foundedYear) : null,
          member_count_range: values.memberCountRange || null,
          website_url: values.websiteUrl || null,
        },
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["company", "profile"], updated);
    },
  });
}
