"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { SeekerProfile } from "@/hooks/seeker/useProfile";

// アバター画像の登録・差し替え。バックエンドはmultipart/form-dataの
// "image"フィールドを1枚だけ受け取る(POST/api/profile/avatar)
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return apiFetch<SeekerProfile>("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["seeker", "profile"], updated);
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<void>("/api/profile/avatar", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.setQueryData<SeekerProfile>(["seeker", "profile"], (old) =>
        old ? { ...old, avatar_url: null } : old,
      );
    },
  });
}
