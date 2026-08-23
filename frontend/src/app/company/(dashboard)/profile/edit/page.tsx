"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import { FormField, formInputClass } from "@/components/form/FormField";
import {
  PREFECTURES,
  memberCountRangeLabels,
  useProfile,
} from "@/hooks/company/useProfile";
import {
  type UpdateProfileValues,
  updateProfileSchema,
  useUpdateProfile,
} from "@/hooks/company/useUpdateProfile";
import { AvatarSection } from "@/components/company/avatar/AvatarSection";
import { CompanyImagesSection } from "@/components/company/profile/CompanyImagesSection";

// バックエンドのフィールド名(snake_case) → フォームのフィールド名(camelCase)
const serverFieldMap: Record<string, keyof UpdateProfileValues> = {
  name: "name",
  description: "description",
  phone_number: "phoneNumber",
  prefecture: "prefecture",
  address_line: "addressLine",
  founded_year: "foundedYear",
  member_count_range: "memberCountRange",
  website_url: "websiteUrl",
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
          description: profile.description ?? "",
          phoneNumber: profile.phone_number ?? "",
          prefecture: profile.prefecture ?? "",
          addressLine: profile.address_line ?? "",
          foundedYear: profile.founded_year?.toString() ?? "",
          memberCountRange: profile.member_count_range ?? "",
          websiteUrl: profile.website_url ?? "",
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
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex items-center justify-end gap-4">
        <Link
          href="/company/profile"
          className="shrink-0 text-sm font-semibold text-emerald-600 hover:underline"
        >
          プロフィール表示に戻る
        </Link>
      </div>

      <div className="py-8">
        <AvatarSection />
      </div>

      <div className="py-8">
        <CompanyImagesSection images={profile.images ?? []} />
      </div>

      <div className="py-8">
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField htmlFor="name" label="会社名" error={errors.name?.message}>
            <input
              id="name"
              type="text"
              {...register("name")}
              className={formInputClass("emerald")}
            />
          </FormField>

          <FormField
            htmlFor="description"
            label="会社概要(任意)"
            error={errors.description?.message}
          >
            <textarea
              id="description"
              {...register("description")}
              rows={3}
              className={formInputClass("emerald")}
            />
          </FormField>

          <FormField
            htmlFor="websiteUrl"
            label="WebサイトURL(任意)"
            error={errors.websiteUrl?.message}
          >
            <input
              id="websiteUrl"
              type="text"
              {...register("websiteUrl")}
              className={formInputClass("emerald")}
            />
          </FormField>

          <FormField
            htmlFor="foundedYear"
            label="設立年(任意)"
            error={errors.foundedYear?.message}
          >
            <input
              id="foundedYear"
              type="number"
              {...register("foundedYear")}
              className={formInputClass("emerald")}
            />
          </FormField>

          <FormField
            htmlFor="memberCountRange"
            label="メンバー数(任意)"
            error={errors.memberCountRange?.message}
          >
            <select
              id="memberCountRange"
              {...register("memberCountRange")}
              className={formInputClass("emerald")}
            >
              <option value="">選択してください</option>
              {Object.entries(memberCountRangeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            htmlFor="phoneNumber"
            label="電話番号(任意)"
            error={errors.phoneNumber?.message}
          >
            <input
              id="phoneNumber"
              type="text"
              {...register("phoneNumber")}
              className={formInputClass("emerald")}
            />
          </FormField>

          <FormField
            htmlFor="prefecture"
            label="都道府県(任意)"
            error={errors.prefecture?.message}
          >
            <select
              id="prefecture"
              {...register("prefecture")}
              className={formInputClass("emerald")}
            >
              <option value="">選択してください</option>
              {PREFECTURES.map((prefecture) => (
                <option key={prefecture} value={prefecture}>
                  {prefecture}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            htmlFor="addressLine"
            label="市区町村以下の住所(任意)"
            error={errors.addressLine?.message}
          >
            <input
              id="addressLine"
              type="text"
              {...register("addressLine")}
              className={formInputClass("emerald")}
            />
          </FormField>

          {updateProfileMutation.isError &&
            !(updateProfileMutation.error instanceof ApiValidationError) && (
              <p role="alert" className="text-sm text-red-600">
                更新に失敗しました。時間をおいて再度お試しください。
              </p>
            )}

          {updateProfileMutation.isSuccess && (
            <p className="text-sm text-emerald-600">保存しました。</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || updateProfileMutation.isPending}
              className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 border border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
