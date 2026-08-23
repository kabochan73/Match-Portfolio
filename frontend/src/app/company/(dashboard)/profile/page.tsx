"use client";

import Link from "next/link";
import { AvatarView } from "@/components/company/avatar/AvatarView";
import { BasicProfileView } from "@/components/company/profile/BasicProfileView";
import { JobPostingCard } from "@/components/company/job-posting/JobPostingCard";
import { ImageGallery } from "@/components/public/ImageGallery";
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
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
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

      <ImageGallery images={profile.images} />

      <div className="py-8">
        <BasicProfileView profile={profile} />
      </div>

      {publishedJobPostings.length > 0 && (
        <div className="border-t border-zinc-400 py-8">
          <h2 className="mb-4 text-xl font-bold text-zinc-900">掲載中の求人</h2>
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
