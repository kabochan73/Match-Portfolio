"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import {
  registerSchema,
  type RegisterValues,
  useRegister,
} from "@/hooks/seeker/auth/useRegister";

// バックエンドのフィールド名(snake_case) → フォームのフィールド名(camelCase)
const serverFieldMap: Record<string, keyof RegisterValues> = {
  name: "name",
  email: "email",
  password: "password",
  comment: "comment",
  portfolio_url: "portfolioUrl",
  birth_date: "birthDate",
};

export default function Page() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });
  const registerMutation = useRegister();

  const onSubmit = handleSubmit((values) => {
    registerMutation.mutate(values, {
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
  });

  return (
    <>
      <h1 className="mt-6 text-center text-xl font-bold text-zinc-900">
        求職者会員登録
      </h1>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-zinc-700">
            氏名
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {errors.name && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

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

        <div>
          <label
            htmlFor="passwordConfirmation"
            className="text-sm font-medium text-zinc-700"
          >
            パスワード(確認用)
          </label>
          <input
            id="passwordConfirmation"
            type="password"
            {...register("passwordConfirmation")}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {errors.passwordConfirmation && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.passwordConfirmation.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="birthDate"
            className="text-sm font-medium text-zinc-700"
          >
            生年月日
          </label>
          <input
            id="birthDate"
            type="date"
            {...register("birthDate")}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {errors.birthDate && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.birthDate.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="comment"
            className="text-sm font-medium text-zinc-700"
          >
            自己紹介コメント(任意)
          </label>
          <textarea
            id="comment"
            {...register("comment")}
            rows={3}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {errors.comment && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.comment.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="portfolioUrl"
            className="text-sm font-medium text-zinc-700"
          >
            ポートフォリオURL(任意)
          </label>
          <input
            id="portfolioUrl"
            type="text"
            {...register("portfolioUrl")}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {errors.portfolioUrl && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.portfolioUrl.message}
            </p>
          )}
        </div>

        {registerMutation.isError &&
          !(registerMutation.error instanceof ApiValidationError) && (
            <p role="alert" className="text-sm text-red-600">
              登録に失敗しました。時間をおいて再度お試しください。
            </p>
          )}

        <button
          type="submit"
          disabled={isSubmitting || registerMutation.isPending}
          className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          登録する
        </button>
      </form>
    </>
  );
}
