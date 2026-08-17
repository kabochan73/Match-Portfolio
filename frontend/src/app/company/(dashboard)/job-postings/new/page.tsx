"use client";

import { useRouter } from "next/navigation";
import { useCreateJobPosting } from "@/hooks/company/useJobPostings";
import { JobPostingForm } from "../_components/JobPostingForm";

// 作成直後は必ずdraft(下書き)なので、一覧に戻って公開操作は
// job-postings/[id]側で行う想定
export default function Page() {
  const router = useRouter();
  const createMutation = useCreateJobPosting();

  return (
    <>
      <h1>求人投稿</h1>
      <JobPostingForm
        submitLabel="下書きとして保存する"
        isPending={createMutation.isPending}
        onSubmit={(values, onError) => {
          createMutation.mutate(values, {
            onSuccess: (jobPosting) => {
              router.push(`/company/job-postings/${jobPosting.id}`);
            },
            onError,
          });
        }}
      />
    </>
  );
}
