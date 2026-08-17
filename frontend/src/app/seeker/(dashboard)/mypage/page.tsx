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
    return <p>読み込み中...</p>;
  }

  if (isError || !profile) {
    return <p role="alert">プロフィールの取得に失敗しました。</p>;
  }

  return (
    <>
      <h1>マイページ</h1>
      <p>
        <Link href="/seeker/mypage/edit">編集する</Link>
      </p>

      <AvatarView avatarUrl={profile.avatar_url} />
      <BasicProfileView profile={profile} />

      <h2>職歴</h2>
      <WorkExperienceListView workExperiences={workExperiences ?? []} />

      <h2>学歴</h2>
      <EducationListView educations={educations ?? []} />

      <h2>資格</h2>
      <CertificationListView certifications={certifications ?? []} />
    </>
  );
}
