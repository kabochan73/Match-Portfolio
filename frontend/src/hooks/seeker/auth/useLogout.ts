"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch("/api/logout", { method: "POST" }),
    onSuccess: () => {
      // ログアウト後に前のユーザーのプロフィール等がキャッシュから見えてしまわないようにクリアする
      queryClient.clear();
      router.push("/seeker/login");
    },
  });
}
