"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import {
  registerSchema,
  type RegisterValues,
  useRegister,
} from "@/hooks/company/useRegister";

// バックエンドのフィールド名(snake_case) → フォームのフィールド名(camelCase)
const serverFieldMap: Record<string, keyof RegisterValues> = {
  name: "name",
  email: "email",
  password: "password",
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
      <h1>企業会員登録</h1>
      <form onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="name">会社名</label>
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

        {registerMutation.isError &&
          !(registerMutation.error instanceof ApiValidationError) && (
            <p role="alert">
              登録に失敗しました。時間をおいて再度お試しください。
            </p>
          )}

        <button
          type="submit"
          disabled={isSubmitting || registerMutation.isPending}
        >
          登録する
        </button>
      </form>
    </>
  );
}
