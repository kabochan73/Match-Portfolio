"use client";

import { use } from "react";
import Link from "next/link";
import {
  useJobPosting,
  useUpdateJobPosting,
} from "@/hooks/company/useJobPostings";
import { JobPostingForm } from "@/components/company/job-posting/JobPostingForm";
import { JobPostingImagesSection } from "@/components/company/job-posting/JobPostingImagesSection";

export default function Page(
  props: PageProps<"/company/job-postings/[id]/edit">,
) {
  // "use client"のためprops.paramsをawaitできず、Reactのuse()でPromiseを展開する
  const { id } = use(props.params);
  const jobPostingId = Number(id);

  const { data: jobPosting, isLoading, isError } = useJobPosting(jobPostingId);
  const updateMutation = useUpdateJobPosting(jobPostingId);

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

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between gap-4 pb-8">
        <h1 className="text-xl font-bold text-zinc-900">求人編集</h1>
        <Link
          href={`/company/job-postings/${jobPostingId}`}
          className="shrink-0 text-sm font-semibold text-emerald-600 hover:underline"
        >
          詳細に戻る
        </Link>
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
