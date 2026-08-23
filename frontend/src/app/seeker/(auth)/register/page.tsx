"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import { FormField, formInputClass } from "@/components/form/FormField";
import { buttonClass } from "@/components/button/buttonClass";
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
        <FormField htmlFor="name" label="氏名" error={errors.name?.message}>
          <input
            id="name"
            type="text"
            {...register("name")}
            className={formInputClass("brand")}
          />
        </FormField>

        <FormField
          htmlFor="email"
          label="メールアドレス"
          error={errors.email?.message}
        >
          <input
            id="email"
            type="email"
            {...register("email")}
            className={formInputClass("brand")}
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
            className={formInputClass("brand")}
          />
        </FormField>

        <FormField
          htmlFor="passwordConfirmation"
          label="パスワード(確認用)"
          error={errors.passwordConfirmation?.message}
        >
          <input
            id="passwordConfirmation"
            type="password"
            {...register("passwordConfirmation")}
            className={formInputClass("brand")}
          />
        </FormField>

        <FormField
          htmlFor="birthDate"
          label="生年月日"
          error={errors.birthDate?.message}
        >
          <input
            id="birthDate"
            type="date"
            {...register("birthDate")}
            className={formInputClass("brand")}
          />
        </FormField>

        <FormField
          htmlFor="comment"
          label="自己紹介コメント(任意)"
          error={errors.comment?.message}
        >
          <textarea
            id="comment"
            {...register("comment")}
            rows={3}
            className={formInputClass("brand")}
          />
        </FormField>

        <FormField
          htmlFor="portfolioUrl"
          label="ポートフォリオURL(任意)"
          error={errors.portfolioUrl?.message}
        >
          <input
            id="portfolioUrl"
            type="text"
            {...register("portfolioUrl")}
            className={formInputClass("brand")}
          />
        </FormField>

        {registerMutation.isError &&
          !(registerMutation.error instanceof ApiValidationError) && (
            <p role="alert" className="text-sm text-red-600">
              登録に失敗しました。時間をおいて再度お試しください。
            </p>
          )}

        <button
          type="submit"
          disabled={isSubmitting || registerMutation.isPending}
          className={`${buttonClass("primary", "brand")} w-full`}
        >
          登録する
        </button>
      </form>
    </>
  );
}
