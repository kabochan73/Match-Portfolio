"use client";

import Link from "next/link";
import { AvatarView } from "@/components/seeker-profile/AvatarView";
import { BasicProfileView } from "@/components/seeker-profile/BasicProfileView";
import { CertificationListView } from "@/components/seeker-profile/CertificationListView";
import { EducationListView } from "@/components/seeker-profile/EducationListView";
import { WorkExperienceListView } from "@/components/seeker-profile/WorkExperienceListView";
import { useCertifications } from "@/hooks/seeker/useCertifications";
import { useEducations } from "@/hooks/seeker/useEducations";
import { useProfile } from "@/hooks/seeker/useProfile";
import { useWorkExperiences } from "@/hooks/seeker/useWorkExperiences";

// マイページの表示専用ページ。編集はすべて/seeker/mypage/editで行う。
// ここで使う表示コンポーネント(src/components/seeker-profile/)は、企業側から
// 応募者を閲覧する画面(company/(dashboard)/applicants/[id]、未実装)でも
// 同じものを使い回す想定のため、データ取得を持たない純粋な表示コンポーネントにしてある
export default function Page() {
  const { data: profile, isLoading, isError } = useProfile();
  const { data: workExperiences } = useWorkExperiences();
  const { data: educations } = useEducations();
  const { data: certifications } = useCertifications();

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
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white shadow-lg">
        <div className="flex items-center justify-between gap-4 p-8">
          <div className="flex items-center gap-4">
            <AvatarView avatarUrl={profile.avatar_url} />
            <h1 className="text-xl font-bold text-zinc-900">
              {profile.name}
            </h1>
          </div>
          <Link
            href="/seeker/mypage/edit"
            className="shrink-0 rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-light"
          >
            編集する
          </Link>
        </div>

        <div className="p-8">
          <BasicProfileView profile={profile} />
        </div>

        <div className="p-8">
          <h2 className="mb-4 text-sm font-bold text-zinc-900">職歴</h2>
          <WorkExperienceListView workExperiences={workExperiences ?? []} />
        </div>

        <div className="p-8">
          <h2 className="mb-4 text-sm font-bold text-zinc-900">学歴</h2>
          <EducationListView educations={educations ?? []} />
        </div>

        <div className="p-8">
          <h2 className="mb-4 text-sm font-bold text-zinc-900">資格</h2>
          <CertificationListView certifications={certifications ?? []} />
        </div>
      </div>
    </div>
  );
}
