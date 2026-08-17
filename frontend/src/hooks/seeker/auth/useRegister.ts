"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

// バックエンドのRegisterUserRequestと対応する項目のみをクライアント側でも検証する。
// 生年月日の18〜60歳ルールのような業務ルールはバックエンド側の判定を正として、
// エラーはサーバーからのフィールドエラーをそのまま表示する(ここでは重複実装しない)
export const registerSchema = z
  .object({
    name: z.string().min(1, "氏名を入力してください").max(255),
    email: z
      .email("メールアドレスの形式で入力してください")
      .min(1, "メールアドレスを入力してください")
      .max(255),
    password: z.string().min(8, "パスワードは8文字以上で入力してください"),
    passwordConfirmation: z.string().min(1, "確認用パスワードを入力してください"),
    comment: z.string().max(200, "200文字以内で入力してください").optional(),
    portfolioUrl: z
      .union([z.url("URLの形式で入力してください"), z.literal("")])
      .optional(),
    birthDate: z.string().min(1, "生年月日を入力してください"),
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
      apiFetch("/api/register", {
        method: "POST",
        body: {
          name: values.name,
          email: values.email,
          password: values.password,
          password_confirmation: values.passwordConfirmation,
          comment: values.comment || null,
          portfolio_url: values.portfolioUrl || null,
          birth_date: values.birthDate,
        },
      }),
    onSuccess: () => {
      // 登録エンドポイントはバックエンド側で自動ログインまで行うので、そのままマイページへ
      router.push("/seeker/mypage");
    },
  });
}
