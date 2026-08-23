"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateJobPosting } from "@/hooks/company/useJobPostings";
import { JobPostingForm } from "@/components/company/job-posting/JobPostingForm";

// 作成直後は必ずdraft(下書き)。保存後はそのままjob-postings/[id](詳細/プレビュー、
// 公開操作もここに集約)へ遷移し、内容を確認してから公開できるようにする
export default function Page() {
  const router = useRouter();
  const createMutation = useCreateJobPosting();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between gap-4 pb-8">
        <h1 className="text-xl font-bold text-zinc-900">求人投稿</h1>
        <Link
          href="/company/job-postings"
          className="shrink-0 text-sm font-semibold text-emerald-600 hover:underline"
        >
          一覧に戻る
        </Link>
      </div>
      <JobPostingForm
        submitLabel="下書きとして保存する"
        isPending={createMutation.isPending}
        onSubmit={(values, onError) => {
          createMutation.mutate(values, {
            onSuccess: (created) => {
              router.push(`/company/job-postings/${created.id}`);
            },
            onError,
          });
        }}
      />
    </div>
  );
}
