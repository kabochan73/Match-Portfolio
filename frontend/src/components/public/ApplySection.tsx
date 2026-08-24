"use client";

// CC。jobs/[id]/page.tsx(SC・ISR)に埋め込む唯一のアイランド。ログイン状態に依存するため、
// このコンポーネントだけをCCとして切り出し、ページ全体はSCのまま保つ
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { buttonClass } from "@/components/button/buttonClass";
import { ApiValidationError } from "@/lib/api/client";
import {
  type ApplyValues,
  applySchema,
  type LikesRemaining,
  useCreateLike,
  useLikesRemaining,
} from "@/hooks/seeker/useLikes";
import { useProfile } from "@/hooks/seeker/useProfile";

// 今月の残りいいね数(通常・スーパー別枠)を1行で表示する
function RemainingLikesNote({ remaining }: { remaining: LikesRemaining }) {
  return (
    <p className="text-sm text-zinc-800">
      今月の残り いいね {remaining.standard.remaining}/
      {remaining.standard.limit} ・ スーパーいいね {remaining.super.remaining}/
      {remaining.super.limit}
    </p>
  );
}

export function ApplySection({ jobPostingId }: { jobPostingId: number }) {
  const { data: profile, isLoading, isError } = useProfile();
  // ログイン前(profile未取得)はリクエストしない
  const { data: remaining } = useLikesRemaining({ enabled: !!profile });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
    defaultValues: { likeType: "standard", motivation: "" },
  });
  const createLikeMutation = useCreateLike(jobPostingId);

  const handleCancel = () => {
    reset();
    setIsFormOpen(false);
  };

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
      <div className="flex flex-col items-end gap-2">
        {remaining && <RemainingLikesNote remaining={remaining} />}
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className={buttonClass("primary", "brand")}
        >
          この求人に応募する👍
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full space-y-4">
      {generalError && (
        <p role="alert" className="text-sm text-red-600">
          {generalError}
        </p>
      )}

      <div>
        <div className="flex items-center justify-end">
          {remaining && <RemainingLikesNote remaining={remaining} />}
        </div>
        <div className="mt-1 flex gap-4">
          <label className="flex items-center gap-1.5 text-sm text-zinc-800">
            <input type="radio" value="standard" {...register("likeType")} />
            いいね
          </label>
          <label className="flex items-center gap-1.5 text-sm text-zinc-800">
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
        <label htmlFor="motivation" className="text-xl font-bold text-zinc-800">
          志望動機
        </label>
        <textarea
          id="motivation"
          {...register("motivation")}
          rows={5}
          className="mt-1 w-full rounded-lg border border-zinc-400 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {errors.motivation && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.motivation.message}
          </p>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonClass("primary", "brand")}
        >
          応募する
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className={buttonClass("secondary")}
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
