"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiValidationError } from "@/lib/api/client";
import {
  jobPostingStatusLabels,
  useCloseJobPosting,
  useDeleteJobPosting,
  useJobPosting,
  usePublishJobPosting,
  useUnpublishJobPosting,
  useUpdateJobPosting,
} from "@/hooks/company/useJobPostings";
import { JobPostingForm } from "@/components/company/job-posting/JobPostingForm";
import { JobPostingImagesSection } from "@/components/company/job-posting/JobPostingImagesSection";

// ApiValidationErrorのフィールド名がstatus/billingのどちらでも表示できるよう、
// 最初に見つかったエラーメッセージを拾う(公開・非公開・募集終了の各エンドポイントは
// リクエストボディを取らないため、setErrorでフォームにマッピングする対象がない)
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
  const updateMutation = useUpdateJobPosting(jobPostingId);
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
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between gap-4 pb-2">
        <p className="mt-1 text-xl font-bold text-zinc-800">
          現在の状態: {jobPostingStatusLabels[jobPosting.status]}
        </p>
        <Link
          href="/company/job-postings"
          className="shrink-0 text-sm font-semibold text-emerald-600 hover:underline"
        >
          一覧に戻る
        </Link>
      </div>

      {statusActionError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {statusActionError}
        </p>
      )}

      <div className="flex flex-wrap gap-3 py-6">
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

      <div className="pb-8">
        <JobPostingImagesSection
          jobPostingId={jobPostingId}
          images={jobPosting.job_posting_images ?? []}
        />
      </div>

      <JobPostingForm
        submitLabel="更新する"
        isPending={updateMutation.isPending}
        defaultValues={{
          title: jobPosting.title,
          description: jobPosting.description,
          desiredCandidate: jobPosting.desired_candidate,
          employmentType: jobPosting.employment_type,
          prefecture: jobPosting.prefecture,
          salaryMin: jobPosting.salary_min.toString(),
          salaryMax: jobPosting.salary_max.toString(),
        }}
        onSubmit={(values, onError) => {
          updateMutation.mutate(values, { onError });
        }}
      />

      {updateMutation.isSuccess && (
        <p className="mt-4 text-right text-sm text-emerald-600">
          更新しました。
        </p>
      )}
    </div>
  );
}
