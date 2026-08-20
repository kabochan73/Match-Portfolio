"use client";

import Link from "next/link";
import {
  type JobPostingStatus,
  employmentTypeLabels,
  jobPostingStatusLabels,
  useJobPostings,
} from "@/hooks/company/useJobPostings";

// ステータスごとのバッジ色。unpublishedはStripeの支払い失敗による強制非公開なので
// draft/closedのグレーとは区別してamberにしている
const statusBadgeClasses: Record<JobPostingStatus, string> = {
  draft: "bg-zinc-100 text-zinc-600",
  published: "bg-emerald-100 text-emerald-700",
  unpublished: "bg-amber-100 text-amber-700",
  closed: "bg-zinc-100 text-zinc-500",
};

export default function Page() {
  const { data: jobPostings, isLoading, isError } = useJobPostings();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between gap-4 pb-8">
        <h1 className="text-2xl font-bold text-zinc-900">求人一覧</h1>
        <Link
          href="/company/job-postings/new"
          className="shrink-0 rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
        >
          求人を新規作成する
        </Link>
      </div>

      {isLoading && (
        <p className="px-4 py-12 text-center text-sm text-zinc-500">
          読み込み中...
        </p>
      )}

      {isError && (
        <p role="alert" className="px-4 py-12 text-center text-sm text-red-600">
          求人一覧の取得に失敗しました。
        </p>
      )}

      {jobPostings && jobPostings.length === 0 && (
        <p className="px-4 py-12 text-center text-sm text-zinc-500">
          求人がまだありません。
        </p>
      )}

      {jobPostings && jobPostings.length > 0 && (
        <ul className="space-y-4">
          {jobPostings.map((jobPosting) => (
            <li key={jobPosting.id}>
              <Link
                href={`/company/job-postings/${jobPosting.id}`}
                className="block rounded-xl border border-zinc-200 p-5 transition hover:border-emerald-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-lg font-bold text-zinc-900">
                    {jobPosting.title}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses[jobPosting.status]}`}
                  >
                    {jobPostingStatusLabels[jobPosting.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  {employmentTypeLabels[jobPosting.employment_type]} /{" "}
                  {jobPosting.prefecture}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  応募数(いいね数): {jobPosting.likes_count ?? 0}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
