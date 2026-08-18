"use client";

// CC。Sanctumのcookie認証データをTanStack Queryで取得するため、routeのparams(Promise)は
// asyncにできずReact 19のuse()で受け取る
import Link from "next/link";
import { use } from "react";
import { AvatarView } from "@/components/seeker-profile/AvatarView";
import { BasicProfileView } from "@/components/seeker-profile/BasicProfileView";
import { CertificationListView } from "@/components/seeker-profile/CertificationListView";
import { EducationListView } from "@/components/seeker-profile/EducationListView";
import { WorkExperienceListView } from "@/components/seeker-profile/WorkExperienceListView";
import {
  likeStatusLabels,
  likeTypeLabels,
  useApplicant,
  useMatchApplicant,
} from "@/hooks/company/useLikes";

export default function Page(props: PageProps<"/company/applicants/[id]">) {
  const { id } = use(props.params);
  const likeId = Number(id);
  const { data: applicant, isLoading, isError } = useApplicant(likeId);
  const matchMutation = useMatchApplicant();

  if (isLoading) {
    return <p>読み込み中...</p>;
  }

  if (isError || !applicant) {
    return <p role="alert">応募者情報の取得に失敗しました。</p>;
  }

  const canMatch =
    applicant.status === "applied" &&
    new Date(applicant.response_deadline) > new Date();

  return (
    <>
      <h1>応募者詳細</h1>
      <p>
        <Link href="/company/applicants">応募者一覧に戻る</Link>
      </p>

      <p>
        {likeTypeLabels[applicant.like_type]} /{" "}
        {likeStatusLabels[applicant.status]}
      </p>

      {canMatch && (
        <button
          type="button"
          onClick={() => matchMutation.mutate(likeId)}
          disabled={matchMutation.isPending}
        >
          気になる
        </button>
      )}
      {matchMutation.isError && (
        <p role="alert">{matchMutation.error.message}</p>
      )}

      {applicant.status === "matched" && (
        <p>
          <Link href={`/company/messages/${applicant.id}`}>
            メッセージを見る
          </Link>
        </p>
      )}

      <h2>志望動機</h2>
      <p>{applicant.motivation}</p>

      <h2>プロフィール</h2>
      <AvatarView avatarUrl={applicant.user.avatar_url} />
      <BasicProfileView profile={applicant.user} />

      <h2>職歴</h2>
      <WorkExperienceListView
        workExperiences={applicant.user.work_experiences}
      />

      <h2>学歴</h2>
      <EducationListView educations={applicant.user.educations} />

      <h2>資格</h2>
      <CertificationListView certifications={applicant.user.certifications} />
    </>
  );
}
