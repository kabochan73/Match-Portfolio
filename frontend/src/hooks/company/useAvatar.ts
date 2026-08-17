"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { CompanyProfile } from "@/hooks/company/useProfile";

// アバター(ロゴ)画像の登録・差し替え。バックエンドはmultipart/form-dataの
// "image"フィールドを1枚だけ受け取る(POST /api/company/profile/avatar)
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return apiFetch<CompanyProfile>("/api/company/profile/avatar", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["company", "profile"], updated);
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<void>("/api/company/profile/avatar", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.setQueryData<CompanyProfile>(["company", "profile"], (old) =>
        old ? { ...old, avatar_url: null } : old,
      );
    },
  });
}
