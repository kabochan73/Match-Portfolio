"use client";

// CC。Sanctumのcookie認証データをTanStack Queryで取得する単発の一覧表示のみのページなので、
// 再利用の予定もなくpage.tsx自体をCCにする
import Link from "next/link";
import { employmentTypeLabels } from "@/lib/jobPostings";
import {
  type LikeStatus,
  likeStatusLabels,
  likeTypeLabels,
  useHideLike,
  useLikes,
} from "@/hooks/seeker/useLikes";

// ステータスごとのバッジ色。company/(dashboard)/job-postingsの配色方針(緑=順調・
// 琥珀=要注目・グレー=非アクティブ)に合わせ、選考中はamber、マッチ成立はemeraldにしている
const statusBadgeClasses: Record<LikeStatus, string> = {
  applied: "bg-amber-100 text-amber-700",
  matched: "bg-emerald-100 text-emerald-700",
  expired: "bg-zinc-100 text-zinc-500",
};

export default function Page() {
  const { data: likes, isLoading, isError } = useLikes();
  const hideLikeMutation = useHideLike();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <h1 className="pb-8 text-2xl font-bold text-zinc-900">応募状況一覧</h1>

      {isLoading && (
        <p className="px-4 py-12 text-center text-sm text-zinc-500">
          読み込み中...
        </p>
      )}

      {isError && (
        <p role="alert" className="px-4 py-12 text-center text-sm text-red-600">
          応募状況の取得に失敗しました。
        </p>
      )}

      {likes && likes.length === 0 && (
        <p className="px-4 py-12 text-center text-sm text-zinc-500">
          まだ応募した求人はありません。
        </p>
      )}

      {likes && likes.length > 0 && (
        <ul className="space-y-4">
          {likes.map((like) => {
            // 求人が非公開/募集終了になった後は、公開求人詳細ページ(/jobs/[id])が
            // 404を返すため、公開中の求人だけをリンクにする(それ以外はクリックできないカードにする)
            const isJobPostingAvailable = like.job_posting.status === "published";

            const cardContent = (
              <>
                {like.job_posting.job_posting_images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- 外部(Laravelのpublic disk)から配信される画像なのでnext/imageの最適化対象外
                  <img
                    src={like.job_posting.job_posting_images[0].url}
                    alt=""
                    width={192}
                    height={128}
                    className="h-32 w-48 shrink-0 border border-zinc-200 bg-zinc-50 object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-48 shrink-0 items-center justify-center border border-zinc-200 bg-zinc-50 text-xs text-zinc-400">
                    No image
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-lg font-bold text-zinc-900">
                    {like.job_posting.title}
                  </p>
                  <p className="mt-1 truncate text-sm text-zinc-600">
                    {like.job_posting.company.name}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {employmentTypeLabels[like.job_posting.employment_type]} /{" "}
                    {like.job_posting.prefecture}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-800">
                    月給 {like.job_posting.salary_min.toLocaleString()}円 〜{" "}
                    {like.job_posting.salary_max.toLocaleString()}円
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-brand">
                      {likeTypeLabels[like.like_type]}
                    </span>
                    応募日 {like.applied_at.slice(0, 10)}
                  </p>
                  {!isJobPostingAvailable && (
                    <p className="mt-1 text-xs text-zinc-400">
                      この求人は現在公開されていません
                    </p>
                  )}
                </div>

                <span
                  className={`absolute right-5 bottom-4 rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses[like.status]}`}
                >
                  {likeStatusLabels[like.status]}
                </span>
              </>
            );

            return (
              <li key={like.id}>
                {isJobPostingAvailable ? (
                  <Link
                    href={`/jobs/${like.job_posting_id}`}
                    className="relative flex items-center gap-5 border border-zinc-200 p-5 pb-4 transition hover:border-sky-300 hover:shadow-sm"
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <>
                    <div className="relative flex items-center gap-5 border border-zinc-200 p-5 pb-4 opacity-60">
                      {cardContent}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => hideLikeMutation.mutate(like.id)}
                        disabled={hideLikeMutation.isPending}
                        className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        この応募を一覧から削除
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
