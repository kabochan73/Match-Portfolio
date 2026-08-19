"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import { useProfile } from "@/hooks/seeker/useProfile";
import {
  type UpdateProfileValues,
  updateProfileSchema,
  useUpdateProfile,
} from "@/hooks/seeker/useUpdateProfile";
import { AvatarSection } from "./_components/AvatarSection";
import { CertificationSection } from "./_components/CertificationSection";
import { EducationSection } from "./_components/EducationSection";
import { WorkExperienceSection } from "./_components/WorkExperienceSection";

// バックエンドのフィールド名(snake_case) → フォームのフィールド名(camelCase)
const serverFieldMap: Record<string, keyof UpdateProfileValues> = {
  name: "name",
  comment: "comment",
  portfolio_url: "portfolioUrl",
  birth_date: "birthDate",
};

export default function Page() {
  const { data: profile, isLoading, isError } = useProfile();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    values: profile
      ? {
          name: profile.name,
          comment: profile.comment ?? "",
          portfolioUrl: profile.portfolio_url ?? "",
          birthDate: profile.birth_date,
        }
      : undefined,
  });
  const updateProfileMutation = useUpdateProfile();

  const onSubmit = handleSubmit((values) => {
    updateProfileMutation.mutate(values, {
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

  if (isLoading) {
    return (
      <p className="px-4 py-12 text-center text-sm text-zinc-500">
        読み込み中...
      </p>
    );
  }

  if (isError || !profile) {
    return (
      <p role="alert" className="px-4 py-12 text-center text-sm text-red-600">
        プロフィールの取得に失敗しました。
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between gap-4 pb-8">
        <h1 className="text-xl font-bold text-zinc-900">プロフィール編集</h1>
        <Link
          href="/seeker/mypage"
          className="shrink-0 text-sm font-semibold text-brand hover:underline"
        >
          マイページ表示に戻る
        </Link>
      </div>

      <div className="border-t border-zinc-400 py-8">
        <AvatarSection />
      </div>

      <div className="border-t border-zinc-400 py-8">
        <form onSubmit={onSubmit} noValidate className="space-y-4">
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

          {updateProfileMutation.isError &&
            !(updateProfileMutation.error instanceof ApiValidationError) && (
              <p role="alert" className="text-sm text-red-600">
                更新に失敗しました。時間をおいて再度お試しください。
              </p>
            )}

          {updateProfileMutation.isSuccess && (
            <p className="text-sm text-brand">保存しました。</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || updateProfileMutation.isPending}
              className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 border border-brand"
            >
              保存する
            </button>
          </div>
        </form>
      </div>

      <div className="border-t border-zinc-400 py-8">
        <WorkExperienceSection />
      </div>

      <div className="border-t border-zinc-400 py-8">
        <EducationSection />
      </div>

      <div className="border-t border-zinc-400 py-8">
        <CertificationSection />
      </div>
    </div>
  );
}
