"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
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
import { AvatarUploadSection } from "./_components/AvatarUploadSection";
import { CoverImageUploadSection } from "./_components/CoverImageUploadSection";

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
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between gap-4 pb-8">
        <h1 className="text-xl font-bold text-zinc-900">
          企業プロフィール編集
        </h1>
        <Link
          href="/company/profile"
          className="shrink-0 text-sm font-semibold text-emerald-600 hover:underline"
        >
          プロフィール表示に戻る
        </Link>
      </div>

      <div className="py-8">
        <AvatarUploadSection />
      </div>

      <div className="py-8">
        <CoverImageUploadSection />
      </div>

      <div className="py-8">
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-zinc-700">
              会社名
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {errors.name && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="text-sm font-medium text-zinc-700"
            >
              会社概要(任意)
            </label>
            <textarea
              id="description"
              {...register("description")}
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {errors.description && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="websiteUrl"
              className="text-sm font-medium text-zinc-700"
            >
              WebサイトURL(任意)
            </label>
            <input
              id="websiteUrl"
              type="text"
              {...register("websiteUrl")}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {errors.websiteUrl && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.websiteUrl.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="foundedYear"
              className="text-sm font-medium text-zinc-700"
            >
              設立年(任意)
            </label>
            <input
              id="foundedYear"
              type="number"
              {...register("foundedYear")}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {errors.foundedYear && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.foundedYear.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="memberCountRange"
              className="text-sm font-medium text-zinc-700"
            >
              メンバー数(任意)
            </label>
            <select
              id="memberCountRange"
              {...register("memberCountRange")}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">選択してください</option>
              {Object.entries(memberCountRangeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.memberCountRange && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.memberCountRange.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="text-sm font-medium text-zinc-700"
            >
              電話番号(任意)
            </label>
            <input
              id="phoneNumber"
              type="text"
              {...register("phoneNumber")}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {errors.phoneNumber && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="prefecture"
              className="text-sm font-medium text-zinc-700"
            >
              都道府県(任意)
            </label>
            <select
              id="prefecture"
              {...register("prefecture")}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">選択してください</option>
              {PREFECTURES.map((prefecture) => (
                <option key={prefecture} value={prefecture}>
                  {prefecture}
                </option>
              ))}
            </select>
            {errors.prefecture && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.prefecture.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="addressLine"
              className="text-sm font-medium text-zinc-700"
            >
              市区町村以下の住所(任意)
            </label>
            <input
              id="addressLine"
              type="text"
              {...register("addressLine")}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {errors.addressLine && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {errors.addressLine.message}
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
