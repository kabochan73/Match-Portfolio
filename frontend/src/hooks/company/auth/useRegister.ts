"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

// name/email/password以外はDB_DESIGN.md通り全てnullableで、登録後のプロフィール編集で埋める想定
// (RegisterCompanyRequest参照)。そのため登録フォーム自体はこの3項目のみで最小限にする
export const registerSchema = z
  .object({
    name: z.string().min(1, "会社名を入力してください").max(255),
    email: z
      .email("メールアドレスの形式で入力してください")
      .min(1, "メールアドレスを入力してください")
      .max(255),
    password: z.string().min(8, "パスワードは8文字以上で入力してください"),
    passwordConfirmation: z
      .string()
      .min(1, "確認用パスワードを入力してください"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "パスワードが一致しません",
    path: ["passwordConfirmation"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (values: RegisterValues) =>
      apiFetch("/api/company/register", {
        method: "POST",
        body: {
          name: values.name,
          email: values.email,
          password: values.password,
          password_confirmation: values.passwordConfirmation,
        },
      }),
    onSuccess: () => {
      // 登録エンドポイントはバックエンド側で自動ログインまで行うので、そのままプロフィール編集へ
      // (会社概要・所在地などの未入力項目をここで埋めてもらう想定)
      router.push("/company/profile");
    },
  });
}
