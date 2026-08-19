"use client";

import Link from "next/link";
import { AvatarView } from "@/components/company-profile/AvatarView";
import { BasicProfileView } from "@/components/company-profile/BasicProfileView";
import { CoverImageView } from "@/components/company-profile/CoverImageView";
import { useProfile } from "@/hooks/company/useProfile";

// 企業プロフィールの表示専用ページ。編集はすべて/company/profile/editで行う。
// 表示コンポーネント(src/components/company-profile/)はデータ取得を持たないため、
// 将来の公開企業ページ(/companies/[id]、未実装)でも同じものを使い回せる
export default function Page() {
  const { data: profile, isLoading, isError } = useProfile();

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
        <div className="flex items-center gap-4">
          <AvatarView avatarUrl={profile.avatar_url} />
          <h1 className="text-4xl font-bold text-zinc-900">{profile.name}</h1>
        </div>
        <Link
          href="/company/profile/edit"
          className="shrink-0 rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
        >
          編集する
        </Link>
      </div>

      <div className="pb-8">
        <CoverImageView coverImageUrl={profile.cover_image_url} />
      </div>

      <div className="py-8">
        <BasicProfileView profile={profile} />
      </div>
    </div>
  );
}
