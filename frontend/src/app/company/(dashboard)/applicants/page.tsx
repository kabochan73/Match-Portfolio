"use client";

// CC。Sanctumのcookie認証データをTanStack Queryで取得する単発ページなのでpage.tsx自体をCCにする
import Link from "next/link";
import { useState } from "react";
import { useJobPostings } from "@/hooks/company/useJobPostings";
import {
  likeStatusLabels,
  likeTypeLabels,
  useApplicants,
} from "@/hooks/company/useLikes";

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
    return <p>読み込み中...</p>;
  }

  if (!jobPostings || jobPostings.length === 0) {
    return <p>まだ求人がありません。</p>;
  }

  return (
    <>
      <h1>応募者一覧</h1>

      <label htmlFor="jobPostingSelect">求人</label>
      <select
        id="jobPostingSelect"
        value={activeId ?? ""}
        onChange={(event) => setSelectedId(Number(event.target.value))}
      >
        {jobPostings.map((jobPosting) => (
          <option key={jobPosting.id} value={jobPosting.id}>
            {jobPosting.title}
          </option>
        ))}
      </select>

      {isApplicantsLoading ? (
        <p>読み込み中...</p>
      ) : isError || !applicants ? (
        <p role="alert">応募者の取得に失敗しました。</p>
      ) : applicants.length === 0 ? (
        <p>この求人への応募はまだありません。</p>
      ) : (
        <ul>
          {applicants.map((applicant) => (
            <li key={applicant.id}>
              <p>
                <Link href={`/company/applicants/${applicant.id}`}>
                  {applicant.user.name}
                </Link>
                ({likeTypeLabels[applicant.like_type]} /{" "}
                {likeStatusLabels[applicant.status]})
              </p>
              <p>応募日: {applicant.applied_at.slice(0, 10)}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
