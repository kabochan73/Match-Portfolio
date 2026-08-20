import Link from "next/link";
import { notFound } from "next/navigation";
import { AvatarView } from "@/components/company/avatar/AvatarView";
import { employmentTypeLabels, getJobPosting } from "@/lib/jobPostings";
import { ApplySection } from "./_components/ApplySection";

// SC。ISR対象(revalidate 2h + オンデマンド再検証は未実装)。いいねボタンのみCCアイランド(ApplySection)として埋め込む
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
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="pb-6">
        <p className="text-sm font-semibold text-brand">
          {jobPosting.company.name}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-900">
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

      {jobPosting.job_posting_images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-6">
          {jobPosting.job_posting_images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element -- 外部(Laravelのpublic disk)から配信される画像なのでnext/imageの最適化対象外
            <img
              key={image.id}
              src={image.url}
              alt=""
              width={320}
              height={224}
              className="h-56 w-80 shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 object-cover"
            />
          ))}
        </div>
      )}

      <div className="border-t border-zinc-200 py-8">
        <h2 className="text-xl font-bold text-zinc-900">職務内容</h2>
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-zinc-700">
          {jobPosting.description}
        </p>
      </div>

      <div className="border-t border-zinc-200 py-8">
        <h2 className="text-xl font-bold text-zinc-900">求める人材像</h2>
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-zinc-700">
          {jobPosting.desired_candidate}
        </p>
      </div>

      <div className="border-t border-zinc-200 py-8">
        <h2 className="text-xl font-bold text-zinc-900">企業情報</h2>
        <div className="mt-4 flex items-center gap-4">
          <AvatarView avatarUrl={jobPosting.company.avatar_url} />
          <div>
            <Link
              href={`/companies/${jobPosting.company.id}`}
              className="text-lg font-semibold text-zinc-900 hover:underline"
            >
              {jobPosting.company.name}
            </Link>
            {jobPosting.company.prefecture && (
              <p className="mt-1 text-sm text-zinc-600">
                {jobPosting.company.prefecture}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 py-8">
        <h2 className="text-xl font-bold text-zinc-900">応募する</h2>
        <div className="mt-4">
          <ApplySection jobPostingId={jobPosting.id} />
        </div>
      </div>
    </div>
  );
}
