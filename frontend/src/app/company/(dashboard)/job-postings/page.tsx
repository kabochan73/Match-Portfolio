"use client";

import Link from "next/link";
import {
  employmentTypeLabels,
  jobPostingStatusLabels,
  useJobPostings,
} from "@/hooks/company/useJobPostings";

export default function Page() {
  const { data: jobPostings, isLoading, isError } = useJobPostings();

  return (
    <>
      <h1>求人一覧</h1>
      <p>
        <Link href="/company/job-postings/new">求人を新規作成する</Link>
      </p>

      {isLoading && <p>読み込み中...</p>}
      {isError && <p role="alert">求人一覧の取得に失敗しました。</p>}

      {jobPostings && jobPostings.length === 0 && <p>求人がまだありません。</p>}

      {jobPostings && jobPostings.length > 0 && (
        <ul>
          {jobPostings.map((jobPosting) => (
            <li key={jobPosting.id}>
              <p>
                <Link href={`/company/job-postings/${jobPosting.id}`}>
                  {jobPosting.title}
                </Link>
              </p>
              <p>
                {jobPostingStatusLabels[jobPosting.status]} /{" "}
                {employmentTypeLabels[jobPosting.employment_type]} /{" "}
                {jobPosting.prefecture}
              </p>
              <p>応募数(いいね数): {jobPosting.likes_count ?? 0}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
