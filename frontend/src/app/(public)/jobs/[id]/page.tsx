import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AvatarView } from "@/components/company/avatar/AvatarView";
import { employmentTypeLabels, getJobPosting } from "@/lib/jobPostings";
import { memberCountRangeLabels } from "@/lib/memberCountRanges";
import { ApplySection } from "@/components/public/ApplySection";
import { ImageGallery } from "@/components/public/ImageGallery";

// SC。ISR対象(revalidate 2h + バックエンドからの/api/revalidate経由のオンデマンド再検証)。
// 状態を持つ部分だけCCアイランド(ImageGallery・ApplySection)として埋め込む
export async function generateStaticParams() {
  return [];
}

export default async function Page(props: PageProps<"/jobs/[id]">) {
  const { id } = await props.params;
  const jobPosting = await getJobPosting(id);

  if (!jobPosting) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="flex justify-end">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-600 hover:text-brand"
        >
          <ChevronLeft size={18} />
          求人一覧へ戻る
        </Link>
      </div>

      <div className="pb-6">
        <h1 className="mt-4 text-3xl font-bold text-zinc-900">
          {jobPosting.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-brand">
            {employmentTypeLabels[jobPosting.employment_type]}
          </span>
          <span className="text-sm text-zinc-600">{jobPosting.prefecture}</span>
          <span className="text-sm font-semibold text-zinc-800">
            月給 {jobPosting.salary_min.toLocaleString()}円 〜{" "}
            {jobPosting.salary_max.toLocaleString()}円
          </span>
          <span className="ml-auto rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-brand">
            ♡ {jobPosting.likes_count}
          </span>
        </div>
      </div>

      <ImageGallery images={jobPosting.job_posting_images} />

      <div className="py-8">
        <h2 className="text-xl font-bold text-zinc-900">職務内容</h2>
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-zinc-800">
          {jobPosting.description}
        </p>
      </div>

      <div className="border-t border-zinc-200 py-8">
        <h2 className="text-xl font-bold text-zinc-900">求める人材像</h2>
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-zinc-800">
          {jobPosting.desired_candidate}
        </p>
      </div>

      <div className="border-t border-zinc-200 py-8">
        <div className="mt-4 flex items-center gap-4">
          <AvatarView avatarUrl={jobPosting.company.avatar_url} />
          <div>
            <Link
              href={`/companies/${jobPosting.company.id}`}
              className="text-lg font-semibold text-zinc-900 hover:text-brand"
            >
              {jobPosting.company.name}
            </Link>
            {jobPosting.company.prefecture && (
              <p className="mt-1 text-sm text-zinc-600">
                {jobPosting.company.prefecture}
              </p>
            )}
            <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-zinc-600">
              {jobPosting.company.founded_year && (
                <span>設立{jobPosting.company.founded_year}年</span>
              )}
              {jobPosting.company.member_count_range && (
                <span>
                  {memberCountRangeLabels[jobPosting.company.member_count_range]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 py-8">
        <div className="mt-4 flex justify-end">
          <ApplySection jobPostingId={jobPosting.id} />
        </div>
      </div>
    </div>
  );
}
