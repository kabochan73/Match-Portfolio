"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { CompanyProfile } from "@/hooks/company/useProfile";

// 企業ホーム画面のカバー画像の登録・差し替え(POST /api/company/profile/cover-image)。
// アバターと同じ形の単一画像アップロードなのでuseAvatar.tsと対になる構成
export function useUpdateCoverImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return apiFetch<CompanyProfile>("/api/company/profile/cover-image", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["company", "profile"], updated);
    },
  });
}

export function useDeleteCoverImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<void>("/api/company/profile/cover-image", {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.setQueryData<CompanyProfile>(["company", "profile"], (old) =>
        old ? { ...old, cover_image_url: null } : old,
      );
    },
  });
}
