"use client";

// CC。Sanctumのcookie認証データをTanStack Queryで取得するため、routeのparams(Promise)は
// asyncにできずReact 19のuse()で受け取る
import { sectionDividerClass, sectionHeadingClass } from "@/lib/sectionStyles";
import { badgeClass } from "@/lib/badgeClass";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { AvatarView } from "@/components/seeker/avatar/AvatarView";
import { BasicProfileView } from "@/components/seeker/profile/BasicProfileView";
import { buttonClass } from "@/components/button/buttonClass";
import { PageError, PageLoading } from "@/components/status/PageStatus";
import { textLinkClass } from "@/lib/textLinkClass";
import { CertificationListView } from "@/components/seeker/certification/CertificationListView";
import { EducationListView } from "@/components/seeker/education/EducationListView";
import { WorkExperienceListView } from "@/components/seeker/work-experience/WorkExperienceListView";
import {
  type LikeStatus,
  likeStatusLabels,
  likeTypeLabels,
  useApplicant,
  useMatchApplicant,
} from "@/hooks/company/useLikes";

// applicants一覧と同じ配色方針
const statusBadgeClasses: Record<LikeStatus, string> = {
  applied: "bg-amber-100 text-amber-700",
  matched: "bg-emerald-100 text-emerald-700",
  expired: "bg-zinc-100 text-zinc-500",
};

export default function Page(props: PageProps<"/company/applicants/[id]">) {
  const { id } = use(props.params);
  const likeId = Number(id);
  const { data: applicant, isLoading, isError } = useApplicant(likeId);
  const matchMutation = useMatchApplicant();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !applicant) {
    return <PageError message="応募者情報の取得に失敗しました。" />;
  }

  const canMatch =
    applicant.status === "applied" &&
    new Date(applicant.response_deadline) > new Date();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between gap-4 pb-2">
        <span
          className={`${badgeClass} ${statusBadgeClasses[applicant.status]}`}
        >
          {likeStatusLabels[applicant.status]}
        </span>
        <Link
          href="/company/applicants"
          className={textLinkClass("emerald")}
        >
          <ChevronLeft size={18} />
          一覧に戻る
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4 py-8">
        <div className="flex items-center gap-4 p-4">
          <AvatarView avatarUrl={applicant.user.avatar_url} />
          <h1 className="text-4xl font-bold text-zinc-900">
            {applicant.user.name}
          </h1>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="rounded-full bg-emerald-50 p-2 px-4 text-sm font-semibold border border-emerald-500 text-emerald-700">
            {likeTypeLabels[applicant.like_type]}👍されました
          </span>

          {canMatch && (
            <button
              type="button"
              onClick={() => matchMutation.mutate(likeId)}
              disabled={matchMutation.isPending}
              className={buttonClass("outline", "emerald")}
            >
              マッチする
            </button>
          )}

          {applicant.status === "matched" && (
            <Link
              href={`/company/messages/${applicant.id}`}
              className={textLinkClass("emerald")}
            >
              メッセージを見る →
            </Link>
          )}
        </div>
      </div>

      {matchMutation.isError && (
        <p role="alert" className="pb-4 text-sm text-red-600">
          {matchMutation.error.message}
        </p>
      )}

      <div className={sectionDividerClass()}>
        <BasicProfileView profile={applicant.user} />
      </div>

      <div className={sectionDividerClass()}>
        <h2 className={`${sectionHeadingClass} mb-4`}>志望動機</h2>
        <p className="whitespace-pre-wrap text-lg text-zinc-900">
          {applicant.motivation}
        </p>
      </div>

      <div className={sectionDividerClass()}>
        <h2 className={`${sectionHeadingClass} mb-4`}>職歴</h2>
        <WorkExperienceListView
          workExperiences={applicant.user.work_experiences}
        />
      </div>

      <div className={sectionDividerClass()}>
        <h2 className={`${sectionHeadingClass} mb-4`}>学歴</h2>
        <EducationListView educations={applicant.user.educations} />
      </div>

      <div className={sectionDividerClass()}>
        <h2 className={`${sectionHeadingClass} mb-4`}>資格</h2>
        <CertificationListView certifications={applicant.user.certifications} />
      </div>
    </div>
  );
}
