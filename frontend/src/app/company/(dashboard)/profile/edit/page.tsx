"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import { memberCountRangeLabels, useProfile } from "@/hooks/company/useProfile";
import {
  type UpdateProfileValues,
  updateProfileSchema,
  useUpdateProfile,
} from "@/hooks/company/useUpdateProfile";
import { AvatarUploadSection } from "./_components/AvatarUploadSection";
import { CoverImageUploadSection } from "./_components/CoverImageUploadSection";

// バックエンドのcompanies.prefectureのCHECK制約(47都道府県)と対応する選択肢
const PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
] as const;

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
    return <p>読み込み中...</p>;
  }

  if (isError || !profile) {
    return <p role="alert">プロフィールの取得に失敗しました。</p>;
  }

  return (
    <>
      <h1>企業プロフィール編集</h1>
      <p>
        <Link href="/company/profile">プロフィール表示に戻る</Link>
      </p>

      <CoverImageUploadSection />
      <AvatarUploadSection />

      <form onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="name">会社名</label>
          <input id="name" type="text" {...register("name")} />
          {errors.name && <p role="alert">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="description">会社概要(任意)</label>
          <textarea id="description" {...register("description")} />
          {errors.description && (
            <p role="alert">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber">電話番号(任意)</label>
          <input id="phoneNumber" type="text" {...register("phoneNumber")} />
          {errors.phoneNumber && (
            <p role="alert">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="prefecture">都道府県(任意)</label>
          <select id="prefecture" {...register("prefecture")}>
            <option value="">選択してください</option>
            {PREFECTURES.map((prefecture) => (
              <option key={prefecture} value={prefecture}>
                {prefecture}
              </option>
            ))}
          </select>
          {errors.prefecture && <p role="alert">{errors.prefecture.message}</p>}
        </div>

        <div>
          <label htmlFor="addressLine">市区町村以下の住所(任意)</label>
          <input id="addressLine" type="text" {...register("addressLine")} />
          {errors.addressLine && (
            <p role="alert">{errors.addressLine.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="foundedYear">設立年(任意)</label>
          <input id="foundedYear" type="number" {...register("foundedYear")} />
          {errors.foundedYear && (
            <p role="alert">{errors.foundedYear.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="memberCountRange">メンバー数(任意)</label>
          <select id="memberCountRange" {...register("memberCountRange")}>
            <option value="">選択してください</option>
            {Object.entries(memberCountRangeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.memberCountRange && (
            <p role="alert">{errors.memberCountRange.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="websiteUrl">WebサイトURL(任意)</label>
          <input id="websiteUrl" type="text" {...register("websiteUrl")} />
          {errors.websiteUrl && <p role="alert">{errors.websiteUrl.message}</p>}
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
    </>
  );
}
