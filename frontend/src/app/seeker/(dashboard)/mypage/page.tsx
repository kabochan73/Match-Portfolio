"use client";

import Link from "next/link";
import { AvatarView } from "@/components/seeker/avatar/AvatarView";
import { buttonClass } from "@/components/button/buttonClass";
import { PageError, PageLoading } from "@/components/status/PageStatus";
import { BasicProfileView } from "@/components/seeker/profile/BasicProfileView";
import { CertificationListView } from "@/components/seeker/certification/CertificationListView";
import { EducationListView } from "@/components/seeker/education/EducationListView";
import { WorkExperienceListView } from "@/components/seeker/work-experience/WorkExperienceListView";
import { useCertifications } from "@/hooks/seeker/useCertifications";
import { useEducations } from "@/hooks/seeker/useEducations";
import { useProfile } from "@/hooks/seeker/useProfile";
import { useWorkExperiences } from "@/hooks/seeker/useWorkExperiences";

// マイページの表示専用ページ。編集はすべて/seeker/mypage/editで行う。
// ここで使う表示コンポーネント(src/components/seeker/配下の*View)は、企業側から
// 応募者を閲覧する画面(company/(dashboard)/applicants/[id]、未実装)でも
// 同じものを使い回す想定のため、データ取得を持たない純粋な表示コンポーネントにしてある
export default function Page() {
  const { data: profile, isLoading, isError } = useProfile();
  const { data: workExperiences } = useWorkExperiences();
  const { data: educations } = useEducations();
  const { data: certifications } = useCertifications();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !profile) {
    return <PageError message="プロフィールの取得に失敗しました。" />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between gap-4 pb-8">
        <div className="flex items-center gap-4 p-4">
          <AvatarView avatarUrl={profile.avatar_url} />
          <h1 className="text-4xl font-bold text-zinc-900">{profile.name}</h1>
        </div>
        <Link
          href="/seeker/mypage/edit"
          className={`${buttonClass("outline", "brand")} shrink-0`}
        >
          編集する
        </Link>
      </div>

      <div className="border-t border-zinc-400 py-8">
        <BasicProfileView profile={profile} />
      </div>

      <div className="border-t border-zinc-400 py-8">
        <h2 className="mb-4 text-xl font-bold text-zinc-900">職歴</h2>
        <WorkExperienceListView workExperiences={workExperiences ?? []} />
      </div>

      <div className="border-t border-zinc-400 py-8">
        <h2 className="mb-4 text-xl font-bold text-zinc-900">学歴</h2>
        <EducationListView educations={educations ?? []} />
      </div>

      <div className="border-t border-zinc-400 py-8">
        <h2 className="mb-4 text-xl font-bold text-zinc-900">資格</h2>
        <CertificationListView certifications={certifications ?? []} />
      </div>
    </div>
  );
}
