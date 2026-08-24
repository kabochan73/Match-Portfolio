"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

// token/emailはリセットメール内リンクのクエリパラメータから引き継ぐものでユーザー入力ではないため、
// フォームバリデーションの対象には含めない(ページ側でsearchParamsから読み取ってmutate時に合成する)
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "パスワードは8文字以上で入力してください"),
    passwordConfirmation: z
      .string()
      .min(1, "確認用パスワードを入力してください"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "パスワードが一致しません",
    path: ["passwordConfirmation"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

type ResetPasswordPayload = ResetPasswordValues & {
  token: string;
  email: string;
};

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      apiFetch("/api/reset-password", {
        method: "POST",
        body: {
          token: payload.token,
          email: payload.email,
          password: payload.password,
          password_confirmation: payload.passwordConfirmation,
        },
      }),
    onSuccess: () => {
      router.push("/seeker/login");
    },
  });
}
