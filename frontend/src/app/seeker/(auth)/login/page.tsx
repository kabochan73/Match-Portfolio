"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
      <h1>求職者ログイン</h1>
      <form onSubmit={onSubmit} noValidate>
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

        {loginMutation.isError &&
          !(loginMutation.error instanceof ApiValidationError) && (
            <p role="alert">
              ログインに失敗しました。時間をおいて再度お試しください。
            </p>
          )}

        <button
          type="submit"
          disabled={isSubmitting || loginMutation.isPending}
        >
          ログイン
        </button>
      </form>
    </>
  );
}
