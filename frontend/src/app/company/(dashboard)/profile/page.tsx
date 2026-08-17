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
    return <p>読み込み中...</p>;
  }

  if (isError || !profile) {
    return <p role="alert">プロフィールの取得に失敗しました。</p>;
  }

  return (
    <>
      <h1>企業プロフィール</h1>
      <p>
        <Link href="/company/profile/edit">編集する</Link>
      </p>

      <CoverImageView coverImageUrl={profile.cover_image_url} />
      <AvatarView avatarUrl={profile.avatar_url} />
      <BasicProfileView profile={profile} />
    </>
  );
}
