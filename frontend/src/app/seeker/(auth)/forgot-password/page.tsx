"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
  useForgotPassword,
} from "@/hooks/seeker/auth/useForgotPassword";

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
        <h1>求職者パスワード再設定リクエスト</h1>
        <p>
          パスワード再設定用のメールを送信しました。メール内のリンクから再設定を行ってください。
        </p>
      </>
    );
  }

  return (
    <>
      <h1>求職者パスワード再設定リクエスト</h1>
      <form onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="email">メールアドレス</label>
          <input id="email" type="email" {...register("email")} />
          {errors.email && <p role="alert">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || forgotPasswordMutation.isPending}
        >
          送信する
        </button>
      </form>
    </>
  );
}
