"use client";

import { sectionDividerClass, sectionHeadingClass } from "@/lib/sectionStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import { buttonClass } from "@/components/button/buttonClass";
import { FormField, formInputClass } from "@/components/form/FormField";
import { PageError, PageLoading } from "@/components/status/PageStatus";
import { textLinkClass } from "@/lib/textLinkClass";
import { useProfile } from "@/hooks/seeker/useProfile";
import {
  type UpdateProfileValues,
  updateProfileSchema,
  useUpdateProfile,
} from "@/hooks/seeker/useUpdateProfile";
import { AvatarSection } from "@/components/seeker/avatar/AvatarSection";
import { CertificationSection } from "@/components/seeker/certification/CertificationSection";
import { EducationSection } from "@/components/seeker/education/EducationSection";
import { WorkExperienceSection } from "@/components/seeker/work-experience/WorkExperienceSection";

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
    return <PageLoading />;
  }

  if (isError || !profile) {
    return <PageError message="プロフィールの取得に失敗しました。" />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex items-center justify-end gap-4 pb-4">
        <Link
          href="/seeker/mypage"
          className={textLinkClass("brand")}
        >
          <ChevronLeft size={18} />
          マイページ表示に戻る
        </Link>
      </div>

      <div className={sectionDividerClass()}>
        <AvatarSection />
      </div>

      <div className={sectionDividerClass()}>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField htmlFor="name" label="氏名" error={errors.name?.message}>
            <input
              id="name"
              type="text"
              {...register("name")}
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
              className={buttonClass("outline", "brand")}
            >
              保存する
            </button>
          </div>
        </form>
      </div>

      <div className={sectionDividerClass()}>
        <WorkExperienceSection />
      </div>

      <div className={sectionDividerClass()}>
        <EducationSection />
      </div>

      <div className={sectionDividerClass()}>
        <CertificationSection />
      </div>
    </div>
  );
}
