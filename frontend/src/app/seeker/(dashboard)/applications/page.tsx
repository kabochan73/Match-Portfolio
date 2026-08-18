"use client";

// CC。Sanctumのcookie認証データをTanStack Queryで取得する単発の一覧表示のみのページなので、
// 再利用の予定もなくpage.tsx自体をCCにする
import Link from "next/link";
import { employmentTypeLabels } from "@/lib/jobPostings";
import {
  likeStatusLabels,
  likeTypeLabels,
  useLikes,
} from "@/hooks/seeker/useLikes";

export default function Page() {
  const { data: likes, isLoading, isError } = useLikes();

  if (isLoading) {
    return <p>読み込み中...</p>;
  }

  if (isError || !likes) {
    return <p role="alert">応募状況の取得に失敗しました。</p>;
  }

  return (
    <>
      <h1>応募状況一覧</h1>

      {likes.length === 0 ? (
        <p>まだ応募した求人はありません。</p>
      ) : (
        <ul>
          {likes.map((like) => (
            <li key={like.id}>
              <p>
                <Link href={`/jobs/${like.job_posting_id}`}>
                  {like.job_posting.title}
                </Link>
                ({employmentTypeLabels[like.job_posting.employment_type]} /{" "}
                {like.job_posting.prefecture})
              </p>
              <p>
                {likeTypeLabels[like.like_type]} /{" "}
                {likeStatusLabels[like.status]}
              </p>
              <p>応募日: {like.applied_at.slice(0, 10)}</p>
              {like.status === "matched" && (
                <p>
                  <Link href={`/seeker/messages/${like.id}`}>
                    メッセージを見る
                  </Link>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
