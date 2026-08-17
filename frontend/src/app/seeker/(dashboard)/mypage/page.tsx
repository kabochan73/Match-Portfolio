"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import { useProfile } from "@/hooks/seeker/useProfile";
import {
  type UpdateProfileValues,
  updateProfileSchema,
  useUpdateProfile,
} from "@/hooks/seeker/useUpdateProfile";
import { WorkExperienceSection } from "./_components/WorkExperienceSection";

// バックエンドのフィールド名(snake_case) → フォームのフィールド名(camelCase)
const serverFieldMap: Record<string, keyof UpdateProfileValues> = {
  name: "name",
  comment: "comment",
  portfolio_url: "portfolioUrl",
  birth_date: "birthDate",
};

// 学歴・資格などの残りのサブリソースは別ルートを作らずこのページ内の_components/に埋め込む予定(未実装)
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
    return <p>読み込み中...</p>;
  }

  if (isError || !profile) {
    return <p role="alert">プロフィールの取得に失敗しました。</p>;
  }

  return (
    <>
      <h1>マイページ(プロフィール編集)</h1>
      <form onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="name">氏名</label>
          <input id="name" type="text" {...register("name")} />
          {errors.name && <p role="alert">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="birthDate">生年月日</label>
          <input id="birthDate" type="date" {...register("birthDate")} />
          {errors.birthDate && <p role="alert">{errors.birthDate.message}</p>}
        </div>

        <div>
          <label htmlFor="comment">自己紹介コメント(任意)</label>
          <textarea id="comment" {...register("comment")} />
          {errors.comment && <p role="alert">{errors.comment.message}</p>}
        </div>

        <div>
          <label htmlFor="portfolioUrl">ポートフォリオURL(任意)</label>
          <input id="portfolioUrl" type="text" {...register("portfolioUrl")} />
          {errors.portfolioUrl && (
            <p role="alert">{errors.portfolioUrl.message}</p>
          )}
        </div>

        {updateProfileMutation.isError &&
          !(updateProfileMutation.error instanceof ApiValidationError) && (
            <p role="alert">
              更新に失敗しました。時間をおいて再度お試しください。
            </p>
          )}

        {updateProfileMutation.isSuccess && <p>保存しました。</p>}

        <button
          type="submit"
          disabled={isSubmitting || updateProfileMutation.isPending}
        >
          保存する
        </button>
      </form>

      <WorkExperienceSection />
    </>
  );
}
