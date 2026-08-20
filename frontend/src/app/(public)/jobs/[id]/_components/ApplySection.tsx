"use client";

// CC。jobs/[id]/page.tsx(SC・ISR)に埋め込む唯一のアイランド。ログイン状態に依存するため、
// このコンポーネントだけをCCとして切り出し、ページ全体はSCのまま保つ
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import {
  type ApplyValues,
  applySchema,
  useCreateLike,
} from "@/hooks/seeker/useLikes";
import { useProfile } from "@/hooks/seeker/useProfile";

export function ApplySection({ jobPostingId }: { jobPostingId: number }) {
  const { data: profile, isLoading, isError } = useProfile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
    defaultValues: { likeType: "standard", motivation: "" },
  });
  const createLikeMutation = useCreateLike(jobPostingId);

  const onSubmit = handleSubmit((values) => {
    createLikeMutation.mutate(values, {
      onError: (error) => {
        if (error instanceof ApiValidationError) {
          if (error.errors.like_type?.[0]) {
            setError("likeType", {
              type: "server",
              message: error.errors.like_type[0],
            });
          }
          if (error.errors.motivation?.[0]) {
            setError("motivation", {
              type: "server",
              message: error.errors.motivation[0],
            });
          }
        }
      },
    });
  });

  // job_posting_idのエラー(重複応募・非公開求人)はどのフォーム項目にも対応しないため、
  // フィールドエラーではなく全体エラーとして表示する
  const generalError =
    createLikeMutation.error instanceof ApiValidationError
      ? createLikeMutation.error.errors.job_posting_id?.[0]
      : undefined;

  if (isLoading) {
    return null;
  }

  if (isError || !profile) {
    return (
      <p className="text-sm text-zinc-600">
        <Link
          href="/seeker/login"
          className="font-semibold text-brand hover:underline"
        >
          ログイン
        </Link>
        すると応募できます。
      </p>
    );
  }

  if (createLikeMutation.isSuccess) {
    return (
      <p className="text-sm font-semibold text-brand">
        応募しました。企業からの返答をお待ちください。
      </p>
    );
  }

  if (!isFormOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsFormOpen(true)}
        className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
      >
        この求人に応募する(いいね)
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-md space-y-4">
      {generalError && (
        <p role="alert" className="text-sm text-red-600">
          {generalError}
        </p>
      )}

      <div>
        <span className="text-sm font-medium text-zinc-700">いいねの種類</span>
        <div className="mt-1 flex gap-4">
          <label className="flex items-center gap-1.5 text-sm text-zinc-700">
            <input type="radio" value="standard" {...register("likeType")} />
            いいね
          </label>
          <label className="flex items-center gap-1.5 text-sm text-zinc-700">
            <input type="radio" value="super" {...register("likeType")} />
            スーパーいいね
          </label>
        </div>
        {errors.likeType && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.likeType.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="motivation"
          className="text-sm font-medium text-zinc-700"
        >
          志望動機
        </label>
        <textarea
          id="motivation"
          {...register("motivation")}
          rows={5}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {errors.motivation && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.motivation.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        応募する
      </button>
    </form>
  );
}
