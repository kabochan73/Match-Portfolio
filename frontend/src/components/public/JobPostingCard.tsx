import Link from "next/link";
import { badgeClass } from "@/lib/badgeClass";
import {
  employmentTypeLabels,
  type PublicJobPostingListItem,
} from "@/lib/jobPostings";

// 求人一覧カードの表示専用コンポーネント。/jobsの検索結果一覧と、
// /companies/[id]の「掲載中の求人」欄の両方で使い回す
export function JobPostingCard({
  jobPosting,
}: {
  jobPosting: PublicJobPostingListItem;
}) {
  return (
    <Link
      href={`/jobs/${jobPosting.id}`}
      className="relative flex items-center gap-5 border border-zinc-400 p-5 pb-4 transition hover:border-sky-400 hover:shadow-sm"
    >
      {jobPosting.job_posting_images[0] ? (
        // eslint-disable-next-line @next/next/no-img-element -- 外部(Laravelのpublic disk)から配信される画像なのでnext/imageの最適化対象外
        <img
          src={jobPosting.job_posting_images[0].url}
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
        <p className="text-lg font-bold text-zinc-900">{jobPosting.title}</p>
        <p className="mt-1 truncate text-sm text-zinc-600">
          {jobPosting.company.name}
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          {employmentTypeLabels[jobPosting.employment_type]} /{" "}
          {jobPosting.prefecture}
        </p>
        <p className="mt-1 text-sm font-semibold text-zinc-800">
          月給 {jobPosting.salary_min.toLocaleString()}円 〜{" "}
          {jobPosting.salary_max.toLocaleString()}円
        </p>
      </div>

      <span className={`absolute right-5 bottom-4 ${badgeClass} bg-sky-50 text-brand`}>
        ♡ {jobPosting.likes_count}
      </span>
    </Link>
  );
}
