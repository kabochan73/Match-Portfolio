"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiFetch, ApiValidationError } from "@/lib/api/client";

// バックエンドのRegisterUserRequestと対応する項目のみをクライアント側でも検証する。
// 生年月日の18〜60歳ルールのような業務ルールはバックエンド側の判定を正として、
// エラーはサーバーからのフィールドエラーをそのまま表示する(ここでは重複実装しない)
const schema = z
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

type FormValues = z.infer<typeof schema>;

// バックエンドのフィールド名(snake_case) → フォームのフィールド名(camelCase)
const serverFieldMap: Record<string, keyof FormValues> = {
  name: "name",
  email: "email",
  password: "password",
  comment: "comment",
  portfolio_url: "portfolioUrl",
  birth_date: "birthDate",
};

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const registerMutation = useMutation({
    mutationFn: (values: FormValues) =>
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
    onError: (error) => {
      if (error instanceof ApiValidationError) {
        for (const [field, messages] of Object.entries(error.errors)) {
          const formField = serverFieldMap[field];
          if (formField && messages[0]) {
            setError(formField, { type: "server", message: messages[0] });
          }
        }
      }
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => registerMutation.mutate(values))}
      noValidate
    >
      <div>
        <label htmlFor="name">氏名</label>
        <input id="name" type="text" {...register("name")} />
        {errors.name && <p role="alert">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email">メールアドレス</label>
        <input id="email" type="email" {...register("email")} />
        {errors.email && <p role="alert">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password">パスワード</label>
        <input id="password" type="password" {...register("password")} />
        {errors.password && <p role="alert">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="passwordConfirmation">パスワード(確認用)</label>
        <input
          id="passwordConfirmation"
          type="password"
          {...register("passwordConfirmation")}
        />
        {errors.passwordConfirmation && (
          <p role="alert">{errors.passwordConfirmation.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="birthDate">生年月日</label>
        <input id="birthDate" type="date" {...register("birthDate")} />
        {errors.birthDate && <p role="alert">{errors.birthDate.message}</p>}
      </div>

      <div>
        <label htmlFor="comment">自己紹介コメント(任意)</label>
        <textarea id="comment" {...register("comment")} />
        {errors.comment && <p role="alert">{errors.comment.message}</p>}
      </div>

      <div>
        <label htmlFor="portfolioUrl">ポートフォリオURL(任意)</label>
        <input id="portfolioUrl" type="text" {...register("portfolioUrl")} />
        {errors.portfolioUrl && (
          <p role="alert">{errors.portfolioUrl.message}</p>
        )}
      </div>

      {registerMutation.isError &&
        !(registerMutation.error instanceof ApiValidationError) && (
          <p role="alert">登録に失敗しました。時間をおいて再度お試しください。</p>
        )}

      <button type="submit" disabled={isSubmitting || registerMutation.isPending}>
        登録する
      </button>
    </form>
  );
}
