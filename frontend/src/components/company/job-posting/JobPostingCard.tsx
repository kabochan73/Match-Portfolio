import Link from "next/link";
import {
  type JobPosting,
  type JobPostingStatus,
  employmentTypeLabels,
  jobPostingStatusLabels,
} from "@/hooks/company/useJobPostings";

// ステータスごとのバッジ色。unpublishedはStripeの支払い失敗による強制非公開なので
// draft/closedのグレーとは区別してamberにしている
const statusBadgeClasses: Record<JobPostingStatus, string> = {
  draft: "bg-zinc-100 text-zinc-600",
  published: "bg-emerald-100 text-emerald-700",
  unpublished: "bg-amber-100 text-amber-700",
  closed: "bg-zinc-100 text-zinc-500",
};

// 求人カードの表示専用コンポーネント。company/job-postings一覧と、
// company/profileの「掲載中の求人」欄の両方で使い回す。どちらも自社の
// 管理画面なので、遷移先は常に/company/job-postings/[id](公開用の/jobs/[id]ではない)
export function JobPostingCard({
  jobPosting,
  showStatusBadge = true,
}: {
  jobPosting: JobPosting;
  showStatusBadge?: boolean;
}) {
  return (
    <Link
      href={`/company/job-postings/${jobPosting.id}`}
      className="relative flex items-center gap-5 border border-zinc-400 p-5 pb-4 transition hover:border-emerald-400 hover:shadow-sm"
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
        <p className="mt-1 text-sm text-zinc-600">
          {employmentTypeLabels[jobPosting.employment_type]} /{" "}
          {jobPosting.prefecture}
        </p>
        <p className="mt-1 text-sm font-semibold text-zinc-800">
          月給 {jobPosting.salary_min.toLocaleString()}円 〜{" "}
          {jobPosting.salary_max.toLocaleString()}円
        </p>
      </div>

      {showStatusBadge && (
        <span
          className={`absolute top-5 right-5 rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses[jobPosting.status]}`}
        >
          {jobPostingStatusLabels[jobPosting.status]}
        </span>
      )}

      <span className="absolute right-5 bottom-4 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        ♡ {jobPosting.likes_count ?? 0}
      </span>
    </Link>
  );
}
