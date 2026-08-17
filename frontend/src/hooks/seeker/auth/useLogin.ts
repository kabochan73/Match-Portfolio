"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

export const loginSchema = z.object({
  email: z
    .email("メールアドレスの形式で入力してください")
    .min(1, "メールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (values: LoginValues) =>
      apiFetch("/api/login", {
        method: "POST",
        body: values,
      }),
    onSuccess: () => {
      router.push("/seeker/mypage");
    },
  });
}
