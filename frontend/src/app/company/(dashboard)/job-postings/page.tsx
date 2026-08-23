"use client";

import Link from "next/link";
import { useJobPostings } from "@/hooks/company/useJobPostings";
import { JobPostingCard } from "@/components/company/job-posting/JobPostingCard";
import { PageError, PageLoading } from "@/components/status/PageStatus";

export default function Page() {
  const { data: jobPostings, isLoading, isError } = useJobPostings();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex items-center justify-end gap-4 pb-8">
        <Link
          href="/company/job-postings/new"
          className="shrink-0 rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
        >
          求人を新規作成する
        </Link>
      </div>

      {isLoading && <PageLoading />}

      {isError && <PageError message="求人一覧の取得に失敗しました。" />}

      {jobPostings && jobPostings.length === 0 && (
        <p className="px-4 py-12 text-center text-sm text-zinc-500">
          求人がまだありません。
        </p>
      )}

      {jobPostings && jobPostings.length > 0 && (
        <ul className="space-y-4">
          {jobPostings.map((jobPosting) => (
            <li key={jobPosting.id}>
              <JobPostingCard jobPosting={jobPosting} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
