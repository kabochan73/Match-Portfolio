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
      <p>
        <Link href="/seeker/login">ログイン</Link>すると応募できます。
      </p>
    );
  }

  if (createLikeMutation.isSuccess) {
    return <p>応募しました。企業からの返答をお待ちください。</p>;
  }

  if (!isFormOpen) {
    return (
      <button type="button" onClick={() => setIsFormOpen(true)}>
        この求人に応募する(いいね)
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {generalError && <p role="alert">{generalError}</p>}

      <div>
        <span>いいねの種類</span>
        <label>
          <input type="radio" value="standard" {...register("likeType")} />
          いいね
        </label>
        <label>
          <input type="radio" value="super" {...register("likeType")} />
          スーパーいいね
        </label>
        {errors.likeType && <p role="alert">{errors.likeType.message}</p>}
      </div>

      <div>
        <label htmlFor="motivation">志望動機</label>
        <textarea id="motivation" {...register("motivation")} />
        {errors.motivation && <p role="alert">{errors.motivation.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        応募する
      </button>
    </form>
  );
}
