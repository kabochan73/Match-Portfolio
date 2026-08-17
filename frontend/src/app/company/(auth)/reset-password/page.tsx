"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
  useResetPassword,
} from "@/hooks/company/auth/useResetPassword";

export default function Page() {
  // useSearchParams()はSuspense境界を要求するため、本体をSuspenseで包んで切り出す
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });
  const resetPasswordMutation = useResetPassword();

  // token/emailはリセットメール内リンクのクエリパラメータ由来。直接このページにアクセスした場合など
  // どちらか欠けていたらAPIを呼んでも必ず失敗するので、その場でフォームを出さずに案内する
  if (!token || !email) {
    return (
      <>
        <h1>企業パスワード再設定</h1>
        <p>
          このリンクは無効です。パスワード再設定はメール内のリンクからやり直してください。
        </p>
      </>
    );
  }

  const onSubmit = handleSubmit((values) => {
    resetPasswordMutation.mutate(
      { ...values, token, email },
      {
        onError: (error) => {
          if (error instanceof ApiValidationError) {
            const message = error.errors.email?.[0];
            if (message) {
              setError("password", { type: "server", message });
            }
          }
        },
      },
    );
  });

  return (
    <>
      <h1>企業パスワード再設定</h1>
      <form onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="password">新しいパスワード</label>
          <input id="password" type="password" {...register("password")} />
          {errors.password && <p role="alert">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="passwordConfirmation">新しいパスワード(確認用)</label>
          <input
            id="passwordConfirmation"
            type="password"
            {...register("passwordConfirmation")}
          />
          {errors.passwordConfirmation && (
            <p role="alert">{errors.passwordConfirmation.message}</p>
          )}
        </div>

        {resetPasswordMutation.isError &&
          !(resetPasswordMutation.error instanceof ApiValidationError) && (
            <p role="alert">
              再設定に失敗しました。時間をおいて再度お試しください。
            </p>
          )}

        <button
          type="submit"
          disabled={isSubmitting || resetPasswordMutation.isPending}
        >
          パスワードを再設定する
        </button>
      </form>
    </>
  );
}
