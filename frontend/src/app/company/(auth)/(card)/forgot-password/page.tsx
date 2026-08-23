"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import { FormField, formInputClass } from "@/components/form/FormField";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
  useForgotPassword,
} from "@/hooks/company/auth/useForgotPassword";

export default function Page() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const forgotPasswordMutation = useForgotPassword();

  const onSubmit = handleSubmit((values) => {
    forgotPasswordMutation.mutate(values, {
      onError: (error) => {
        if (error instanceof ApiValidationError) {
          const message = error.errors.email?.[0];
          if (message) {
            setError("email", { type: "server", message });
          }
        }
      },
    });
  });

  if (forgotPasswordMutation.isSuccess) {
    return (
      <>
        <h1 className="text-center text-xl font-bold text-zinc-900">
          企業パスワード再設定リクエスト
        </h1>
        <p className="mt-6 text-sm text-zinc-600">
          パスワード再設定用のメールを送信しました。メール内のリンクから再設定を行ってください。
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-center text-xl font-bold text-zinc-900">
        企業パスワード再設定リクエスト
      </h1>
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

        <button
          type="submit"
          disabled={isSubmitting || forgotPasswordMutation.isPending}
          className="w-full rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          送信する
        </button>
      </form>
    </>
  );
}
