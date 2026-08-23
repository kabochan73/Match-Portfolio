"use client";

import { sectionDividerClass, sectionHeadingClass } from "@/lib/sectionStyles";
import Link from "next/link";
import { AvatarView } from "@/components/company/avatar/AvatarView";
import { BasicProfileView } from "@/components/company/profile/BasicProfileView";
import { buttonClass } from "@/components/button/buttonClass";
import { JobPostingCard } from "@/components/company/job-posting/JobPostingCard";
import { ImageGallery } from "@/components/public/ImageGallery";
import { PageError, PageLoading } from "@/components/status/PageStatus";
import { useProfile } from "@/hooks/company/useProfile";
import { useJobPostings } from "@/hooks/company/useJobPostings";

// 企業プロフィールの表示専用ページ。編集はすべて/company/profile/editで行う。
// 表示コンポーネント(src/components/company/配下の*View)はデータ取得を持たないため、
// 公開企業ページ(/companies/[id])や求人詳細ページ(/jobs/[id])でも同じものを使い回している。
// カバー画像はcompany_images(写真ギャラリー)が兼ねるため、単独のカバー画像コンポーネントは持たない
export default function Page() {
  const { data: profile, isLoading, isError } = useProfile();
  const { data: jobPostings } = useJobPostings();
  const publishedJobPostings =
    jobPostings?.filter((jobPosting) => jobPosting.status === "published") ??
    [];

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !profile) {
    return <PageError message="プロフィールの取得に失敗しました。" />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between gap-4 pb-8">
        <div className="flex items-center gap-4">
          <AvatarView avatarUrl={profile.avatar_url} />
          <h1 className="text-4xl font-bold text-zinc-900">{profile.name}</h1>
        </div>
        <Link
          href="/company/profile/edit"
          className={`${buttonClass("outline", "emerald")} shrink-0`}
        >
          編集する
        </Link>
      </div>

      <ImageGallery images={profile.images} />

      <div className="py-8">
        <BasicProfileView profile={profile} />
      </div>

      {publishedJobPostings.length > 0 && (
        <div className={sectionDividerClass()}>
          <h2 className={`${sectionHeadingClass} mb-4`}>掲載中の求人</h2>
          <ul className="space-y-4">
            {publishedJobPostings.map((jobPosting) => (
              <li key={jobPosting.id}>
                <JobPostingCard
                  jobPosting={jobPosting}
                  showStatusBadge={false}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
