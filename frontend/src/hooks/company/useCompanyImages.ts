"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { CompanyImage, CompanyProfile } from "@/hooks/company/useProfile";

// プロフィールの写真ギャラリー画像の登録。バックエンドはmultipart/form-dataの"image"フィールドを
// 1枚だけ受け取り、追加した画像1件分(position込み)を返す(POST /api/company/profile/images)。
// images配列を持つプロフィールのキャッシュにその場で追記し、再取得を待たずに一覧へ反映する
// (useJobPostingImages.tsと同じパターン)
export function useUploadCompanyImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return apiFetch<CompanyImage>("/api/company/profile/images", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (created) => {
      queryClient.setQueryData<CompanyProfile>(["company", "profile"], (old) =>
        old ? { ...old, images: [...(old.images ?? []), created] } : old,
      );
    },
  });
}

export function useDeleteCompanyImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: number) =>
      apiFetch<void>(`/api/company/profile/images/${imageId}`, {
        method: "DELETE",
      }),
    onSuccess: (_, imageId) => {
      queryClient.setQueryData<CompanyProfile>(["company", "profile"], (old) =>
        old
          ? {
              ...old,
              images: old.images?.filter((image) => image.id !== imageId),
            }
          : old,
      );
    },
  });
}
