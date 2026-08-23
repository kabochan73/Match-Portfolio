"use client";

// CC。Sanctumのcookie認証データをTanStack Queryで取得する単発ページなのでpage.tsx自体をCCにする
import Link from "next/link";
import { useState } from "react";
import { AvatarView } from "@/components/seeker/avatar/AvatarView";
import { PageError, PageLoading } from "@/components/status/PageStatus";
import { badgeClass } from "@/lib/badgeClass";
import { useJobPostings } from "@/hooks/company/useJobPostings";
import {
  type LikeStatus,
  likeStatusLabels,
  likeTypeLabels,
  useApplicants,
} from "@/hooks/company/useLikes";

// ステータスごとのバッジ色。job-postings一覧の配色方針(緑=順調・琥珀=要注目・
// グレー=非アクティブ)に合わせ、選考中はamber、マッチ成立はemeraldにしている
const statusBadgeClasses: Record<LikeStatus, string> = {
  applied: "bg-amber-100 text-amber-700",
  matched: "bg-emerald-100 text-emerald-700",
  expired: "bg-zinc-100 text-zinc-500",
};

export default function Page() {
  const { data: jobPostings, isLoading: isJobPostingsLoading } =
    useJobPostings();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 未選択時は先頭の求人をデフォルトにする(バックエンドが求人単位のエンドポイントしか
  // 提供していないため、全求人横断の一覧ではなく求人セレクタで切り替える形にしている)
  const activeId = selectedId ?? jobPostings?.[0]?.id ?? null;
  const {
    data: applicants,
    isLoading: isApplicantsLoading,
    isError,
  } = useApplicants(activeId ?? 0);

  if (isJobPostingsLoading) {
    return <PageLoading />;
  }

  if (!jobPostings || jobPostings.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <p className="px-4 py-8 text-center text-sm text-zinc-500">
          まだ求人がありません。
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="flex items-end justify-end gap-4">

        <div className="w-64">
          <select
            id="jobPostingSelect"
            value={activeId ?? ""}
            onChange={(event) => setSelectedId(Number(event.target.value))}
            className="mt-1 w-full border border-zinc-400 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {jobPostings.map((jobPosting) => (
              <option key={jobPosting.id} value={jobPosting.id}>
                {jobPosting.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8">
        {isApplicantsLoading && <PageLoading />}

        {!isApplicantsLoading && (isError || !applicants) && (
          <PageError message="応募者の取得に失敗しました。" />
        )}

        {applicants && applicants.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-zinc-500">
            この求人への応募はまだありません。
          </p>
        )}

        {applicants && applicants.length > 0 && (
          <ul className="space-y-4">
            {applicants.map((applicant) => (
              <li key={applicant.id}>
                <Link
                  href={`/company/applicants/${applicant.id}`}
                  className="relative flex items-center gap-5 border border-zinc-400 p-5 pb-4 transition hover:border-emerald-400 hover:shadow-sm"
                >
                  <AvatarView avatarUrl={applicant.user.avatar_url} />

                  <div className="min-w-0 mt-2">
                    <p className="text-2xl font-bold text-zinc-900">
                      {applicant.user.name}
                    </p>
                    <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        {likeTypeLabels[applicant.like_type]}
                      </span>
                      応募日 {applicant.applied_at.slice(0, 10)}
                      {applicant.status === "applied" && (
                        <>
                          {" "}
                          / 回答期限 {applicant.response_deadline.slice(0, 10)}
                        </>
                      )}
                    </p>
                  </div>

                  <span
                    className={`absolute right-5 bottom-6 ${badgeClass} ${statusBadgeClasses[applicant.status]}`}
                  >
                    {likeStatusLabels[applicant.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
