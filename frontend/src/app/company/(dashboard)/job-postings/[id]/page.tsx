"use client";

import { use } from "react";
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
import { JobPostingForm } from "../_components/JobPostingForm";

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
    return <p>読み込み中...</p>;
  }

  if (isError || !jobPosting) {
    return <p role="alert">求人の取得に失敗しました。</p>;
  }

  const statusActionError =
    firstErrorMessage(publishMutation.error) ??
    firstErrorMessage(unpublishMutation.error) ??
    firstErrorMessage(closeMutation.error);

  return (
    <>
      <h1>求人編集(ID: {id})</h1>
      <p>現在の状態: {jobPostingStatusLabels[jobPosting.status]}</p>

      {statusActionError && <p role="alert">{statusActionError}</p>}

      {(jobPosting.status === "draft" ||
        jobPosting.status === "unpublished") && (
        <button
          type="button"
          disabled={publishMutation.isPending}
          onClick={() => publishMutation.mutate(jobPostingId)}
        >
          公開する
        </button>
      )}

      {jobPosting.status === "published" && (
        <button
          type="button"
          disabled={unpublishMutation.isPending}
          onClick={() => unpublishMutation.mutate(jobPostingId)}
        >
          非公開にする
        </button>
      )}

      {jobPosting.status !== "closed" && (
        <button
          type="button"
          disabled={closeMutation.isPending}
          onClick={() => closeMutation.mutate(jobPostingId)}
        >
          募集終了する
        </button>
      )}

      <button
        type="button"
        disabled={deleteMutation.isPending}
        onClick={() => {
          deleteMutation.mutate(jobPostingId, {
            onSuccess: () => router.push("/company/job-postings"),
          });
        }}
      >
        削除する
      </button>

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
    </>
  );
}
