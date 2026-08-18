"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import {
  loginSchema,
  type LoginValues,
  useLogin,
} from "@/hooks/seeker/auth/useLogin";

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
      <h1 className="text-center text-xl font-bold text-zinc-900">
        求職者ログイン
      </h1>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="text-sm font-medium text-zinc-700"
          >
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {errors.email && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="text-sm font-medium text-zinc-700"
          >
            パスワード
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {errors.password && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {loginMutation.isError &&
          !(loginMutation.error instanceof ApiValidationError) && (
            <p role="alert" className="text-sm text-red-600">
              ログインに失敗しました。時間をおいて再度お試しください。
            </p>
          )}

        <button
          type="submit"
          disabled={isSubmitting || loginMutation.isPending}
          className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ログイン
        </button>

        <Link
          href="/seeker/forgot-password"
          className="block text-center text-sm text-brand hover:underline"
        >
          パスワードを忘れた方はこちら
        </Link>
      </form>
    </>
  );
}
