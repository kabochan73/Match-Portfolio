"use client";

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
import { ImageGallery } from "@/components/public/ImageGallery";

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
    return (
      <p className="px-4 py-12 text-center text-sm text-zinc-500">
        読み込み中...
      </p>
    );
  }

  if (isError || !jobPosting) {
    return (
      <p role="alert" className="px-4 py-12 text-center text-sm text-red-600">
        求人の取得に失敗しました。
      </p>
    );
  }

  const statusActionError =
    firstErrorMessage(publishMutation.error) ??
    firstErrorMessage(unpublishMutation.error) ??
    firstErrorMessage(closeMutation.error);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
          {jobPostingStatusLabels[jobPosting.status]}
        </span>
        <div className="flex items-center gap-4">
          <Link
            href={`/company/job-postings/${jobPostingId}/edit`}
            className="shrink-0 text-sm font-semibold text-emerald-600 hover:underline"
          >
            編集する
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="shrink-0 text-sm font-semibold text-emerald-600 hover:underline"
          >
            戻る
          </button>
        </div>
      </div>

      <div className="pb-6">
        <h1 className="mt-4 text-3xl font-bold text-zinc-900">
          {jobPosting.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            {employmentTypeLabels[jobPosting.employment_type]}
          </span>
          <span className="text-sm text-zinc-600">{jobPosting.prefecture}</span>
          <span className="text-sm font-semibold text-zinc-800">
            月給 {jobPosting.salary_min.toLocaleString()}円 〜{" "}
            {jobPosting.salary_max.toLocaleString()}円
          </span>
          <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            ♡ {jobPosting.likes_count ?? 0}
          </span>
        </div>
      </div>

      <ImageGallery images={jobPosting.job_posting_images ?? []} />

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

      {profile && (
        <div className="border-t border-zinc-200 py-8">
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

      <div className="border-t border-zinc-200 py-8">
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
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              公開する
            </button>
          )}

          {jobPosting.status === "closed" && (
            <button
              type="button"
              disabled={publishMutation.isPending}
              onClick={() => publishMutation.mutate(jobPostingId)}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              再公開する
            </button>
          )}

          {jobPosting.status === "published" && (
            <button
              type="button"
              disabled={unpublishMutation.isPending}
              onClick={() => unpublishMutation.mutate(jobPostingId)}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              非公開にする
            </button>
          )}

          {jobPosting.status !== "closed" && (
            <button
              type="button"
              disabled={closeMutation.isPending}
              onClick={() => closeMutation.mutate(jobPostingId)}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
