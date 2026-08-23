"use client";

import { sectionHeadingClass } from "@/lib/sectionStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import { FormField, formInputClass } from "@/components/form/FormField";
import { buttonClass } from "@/components/button/buttonClass";
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
        <h1 className={`${sectionHeadingClass} text-center`}>
          企業パスワード再設定
        </h1>
        <p className="mt-6 text-sm text-zinc-600">
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
      <h1 className={`${sectionHeadingClass} text-center`}>
        企業パスワード再設定
      </h1>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <FormField
          htmlFor="password"
          label="新しいパスワード"
          error={errors.password?.message}
        >
          <input
            id="password"
            type="password"
            {...register("password")}
            className={formInputClass("emerald")}
          />
        </FormField>

        <FormField
          htmlFor="passwordConfirmation"
          label="新しいパスワード(確認用)"
          error={errors.passwordConfirmation?.message}
        >
          <input
            id="passwordConfirmation"
            type="password"
            {...register("passwordConfirmation")}
            className={formInputClass("emerald")}
          />
        </FormField>

        {resetPasswordMutation.isError &&
          !(resetPasswordMutation.error instanceof ApiValidationError) && (
            <p role="alert" className="text-sm text-red-600">
              再設定に失敗しました。時間をおいて再度お試しください。
            </p>
          )}

        <button
          type="submit"
          disabled={isSubmitting || resetPasswordMutation.isPending}
          className={`${buttonClass("primary", "emerald")} w-full`}
        >
          パスワードを再設定する
        </button>
      </form>
    </>
  );
}
