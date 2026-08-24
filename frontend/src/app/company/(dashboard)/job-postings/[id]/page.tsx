"use client";

import { sectionDividerClass, sectionHeadingClass } from "@/lib/sectionStyles";
import { badgeClass } from "@/lib/badgeClass";
import { textLinkClass } from "@/lib/textLinkClass";
import { ChevronLeft } from "lucide-react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiValidationError } from "@/lib/api/client";
import {
  employmentTypeLabels,
  jobPostingStatusLabels,
  useCloseJobPosting,
  useDeleteJobPosting,
  useJobPosting,
  usePublishJobPosting,
  useUnpublishJobPosting,
} from "@/hooks/company/useJobPostings";
import { memberCountRangeLabels, useProfile } from "@/hooks/company/useProfile";
import { AvatarView } from "@/components/company/avatar/AvatarView";
import { buttonClass } from "@/components/button/buttonClass";
import { ImageGallery } from "@/components/public/ImageGallery";
import { PageError, PageLoading } from "@/components/status/PageStatus";

// 求人の詳細(プレビュー)ページ。実際に応募者へ見える公開求人詳細ページ(/jobs/[id])と
// 同じ構成・同じ見た目にする(画像はImageGallery、末尾に企業情報)ことで、
// 「公開したらどう見えるか」をそのまま確認できるようにしている。画像の追加・削除は
// job-postings/[id]/edit側に集約し、ここでは常に閲覧用の表示のみ。
// 公開・非公開・募集終了・削除といった状態変更の操作もここに集約している
function firstErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiValidationError)) {
    return null;
  }
  const firstMessages = Object.values(error.errors)[0];
  return firstMessages?.[0] ?? null;
}

export default function Page(props: PageProps<"/company/job-postings/[id]">) {
  const router = useRouter();
  // "use client"のためprops.paramsをawaitできず、Reactのuse()でPromiseを展開する
  const { id } = use(props.params);
  const jobPostingId = Number(id);

  const { data: jobPosting, isLoading, isError } = useJobPosting(jobPostingId);
  const { data: profile } = useProfile();
  const deleteMutation = useDeleteJobPosting();
  const publishMutation = usePublishJobPosting();
  const unpublishMutation = useUnpublishJobPosting();
  const closeMutation = useCloseJobPosting();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !jobPosting) {
    return <PageError message="求人の取得に失敗しました。" />;
  }

  const statusActionError =
    firstErrorMessage(publishMutation.error) ??
    firstErrorMessage(unpublishMutation.error) ??
    firstErrorMessage(closeMutation.error);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <span className={`${badgeClass} bg-emerald-100 text-emerald-700`}>
          {jobPostingStatusLabels[jobPosting.status]}
        </span>
        <div className="flex items-center gap-4">
          <Link
            href={`/company/job-postings/${jobPostingId}/edit`}
            className={textLinkClass("emerald")}
          >
            編集する
          </Link>
          <Link
            href="/company/job-postings"
            className={textLinkClass("emerald")}
          >
            <ChevronLeft size={18} />
            一覧に戻る
          </Link>
        </div>
      </div>

      <div className="pb-6">
        <h1 className="mt-4 text-3xl font-bold text-zinc-900">
          {jobPosting.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className={`${badgeClass} bg-emerald-50 text-emerald-700`}>
            {employmentTypeLabels[jobPosting.employment_type]}
          </span>
          <span className="text-sm text-zinc-600">{jobPosting.prefecture}</span>
          <span className="text-sm font-semibold text-zinc-800">
            月給 {jobPosting.salary_min.toLocaleString()}円 〜{" "}
            {jobPosting.salary_max.toLocaleString()}円
          </span>
          <span className={`ml-auto ${badgeClass} bg-emerald-50 text-emerald-700`}>
            ♡ {jobPosting.likes_count ?? 0}
          </span>
        </div>
      </div>

      <ImageGallery images={jobPosting.job_posting_images ?? []} />

      <div className="py-8">
        <h2 className={sectionHeadingClass}>職務内容</h2>
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-zinc-800">
          {jobPosting.description}
        </p>
      </div>

      <div className={sectionDividerClass("subtle")}>
        <h2 className={sectionHeadingClass}>求める人材像</h2>
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-zinc-800">
          {jobPosting.desired_candidate}
        </p>
      </div>

      {profile && (
        <div className={sectionDividerClass("subtle")}>
          <div className="mt-4 flex items-center gap-4">
            <AvatarView avatarUrl={profile.avatar_url} />
            <div>
              <Link
                href={`/companies/${profile.id}`}
                className="text-lg font-semibold text-zinc-900 hover:text-emerald-600"
              >
                {profile.name}
              </Link>
              {profile.prefecture && (
                <p className="mt-1 text-sm text-zinc-600">
                  {profile.prefecture}
                </p>
              )}
              <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-zinc-600">
                {profile.founded_year && (
                  <span>設立{profile.founded_year}年</span>
                )}
                {profile.member_count_range && (
                  <span>
                    {memberCountRangeLabels[profile.member_count_range]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={sectionDividerClass("subtle")}>
        {statusActionError && (
          <p role="alert" className="mb-3 text-sm text-red-600">
            {statusActionError}
          </p>
        )}

        <div className="mt-4 flex flex-wrap justify-end gap-3">
          {(jobPosting.status === "draft" ||
            jobPosting.status === "unpublished") && (
            <button
              type="button"
              disabled={publishMutation.isPending}
              onClick={() => publishMutation.mutate(jobPostingId)}
              className={buttonClass("primary", "emerald")}
            >
              公開する
            </button>
          )}

          {jobPosting.status === "closed" && (
            <button
              type="button"
              disabled={publishMutation.isPending}
              onClick={() => publishMutation.mutate(jobPostingId)}
              className={buttonClass("primary", "emerald")}
            >
              再公開する
            </button>
          )}

          {jobPosting.status === "published" && (
            <button
              type="button"
              disabled={unpublishMutation.isPending}
              onClick={() => unpublishMutation.mutate(jobPostingId)}
              className={buttonClass("secondary")}
            >
              非公開にする
            </button>
          )}

          {jobPosting.status !== "closed" && (
            <button
              type="button"
              disabled={closeMutation.isPending}
              onClick={() => closeMutation.mutate(jobPostingId)}
              className={buttonClass("secondary")}
            >
              募集終了する
            </button>
          )}

          <button
            type="button"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (
                window.confirm(
                  "この求人を削除しますか？この操作は取り消せません。",
                )
              ) {
                deleteMutation.mutate(jobPostingId, {
                  onSuccess: () => router.push("/company/job-postings"),
                });
              }
            }}
            className={buttonClass("danger")}
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
