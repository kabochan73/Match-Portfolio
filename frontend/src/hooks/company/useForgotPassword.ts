"use client";

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

export const forgotPasswordSchema = z.object({
  email: z
    .email("メールアドレスの形式で入力してください")
    .min(1, "メールアドレスを入力してください"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function useForgotPassword() {
  return useMutation({
    mutationFn: (values: ForgotPasswordValues) =>
      apiFetch("/api/company/forgot-password", {
        method: "POST",
        body: values,
      }),
  });
}
