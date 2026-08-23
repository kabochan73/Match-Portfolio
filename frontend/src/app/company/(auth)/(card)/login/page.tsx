"use client";

import { sectionHeadingClass } from "@/lib/sectionStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import { FormField, formInputClass } from "@/components/form/FormField";
import { buttonClass } from "@/components/button/buttonClass";
import {
  loginSchema,
  type LoginValues,
  useLogin,
} from "@/hooks/company/auth/useLogin";

export default function Page() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });
  const loginMutation = useLogin();

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values, {
      onError: (error) => {
        if (error instanceof ApiValidationError) {
          // メールアドレス未登録/パスワード違いを区別せず、常にemailフィールドにエラーが返る(バックエンド仕様)
          const message = error.errors.email?.[0];
          if (message) {
            setError("email", { type: "server", message });
          }
        }
      },
    });
  });

  return (
    <>
      <h1 className={`${sectionHeadingClass} text-center`}>企業ログイン</h1>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <FormField
          htmlFor="email"
          label="メールアドレス"
          error={errors.email?.message}
        >
          <input
            id="email"
            type="email"
            {...register("email")}
            className={formInputClass("emerald")}
          />
        </FormField>

        <FormField
          htmlFor="password"
          label="パスワード"
          error={errors.password?.message}
        >
          <input
            id="password"
            type="password"
            {...register("password")}
            className={formInputClass("emerald")}
          />
        </FormField>

        {loginMutation.isError &&
          !(loginMutation.error instanceof ApiValidationError) && (
            <p role="alert" className="text-sm text-red-600">
              ログインに失敗しました。時間をおいて再度お試しください。
            </p>
          )}

        <button
          type="submit"
          disabled={isSubmitting || loginMutation.isPending}
          className={`${buttonClass("primary", "emerald")} w-full`}
        >
          ログイン
        </button>

        <Link
          href="/company/forgot-password"
          className="block text-center text-sm text-emerald-600 hover:underline"
        >
          パスワードを忘れた方はこちら
        </Link>
      </form>
    </>
  );
}
