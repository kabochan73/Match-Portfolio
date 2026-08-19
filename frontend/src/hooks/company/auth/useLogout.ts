"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch("/api/company/logout", { method: "POST" }),
    onSuccess: () => {
      // ログアウト後に前の企業のプロフィール等がキャッシュから見えてしまわないようにクリアする
      queryClient.clear();
      router.push("/");
    },
  });
}
