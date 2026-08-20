"use client";

import { useState } from "react";
import { ApiValidationError } from "@/lib/api/client";
import type { JobPostingImage } from "@/hooks/company/useJobPostings";
import {
  useDeleteJobPostingImage,
  useUploadJobPostingImage,
} from "@/hooks/company/useJobPostingImages";

// バックエンドのUpdateImageRequestと同じ制約(jpeg/png/webp、5MB以内)。
// アップロード前に弾ける明らかな不正入力はここでチェックし、それ以外は
// サーバー側のバリデーションエラーをそのまま表示する(AvatarSectionと同じ方針)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5120 * 1024;
const MAX_IMAGES = 5;

export function JobPostingImagesSection({
  jobPostingId,
  images,
}: {
  jobPostingId: number;
  images: JobPostingImage[];
}) {
  const uploadMutation = useUploadJobPostingImage(jobPostingId);
  const deleteMutation = useDeleteJobPostingImage(jobPostingId);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setClientError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setClientError("jpeg・png・webp形式の画像を選択してください。");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setClientError("5MB以下の画像を選択してください。");
      return;
    }

    uploadMutation.mutate(file);
  };

  const serverErrorMessage =
    uploadMutation.error instanceof ApiValidationError
      ? uploadMutation.error.errors.image?.[0]
      : undefined;

  const canAddMore = images.length < MAX_IMAGES;

  return (
    <section>
      <h2 className="mb-4 text-sm font-bold text-zinc-900">
        求人画像({images.length}/{MAX_IMAGES}枚)
      </h2>

      <div className="flex flex-wrap gap-3">
        {images.map((image) => (
          <div key={image.id} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- 外部(Laravelのpublic disk)から配信される画像なのでnext/imageの最適化対象外 */}
            <img
              src={image.url}
              alt=""
              width={112}
              height={112}
              className="size-28 rounded-lg border border-zinc-200 object-cover"
            />
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(image.id)}
              aria-label="この画像を削除する"
              className="absolute top-1 right-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-red-600 opacity-0 shadow transition group-hover:opacity-100 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              削除
            </button>
          </div>
        ))}

        {canAddMore && (
          <label
            htmlFor="jobPostingImageFile"
            className="flex size-28 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 text-xs font-semibold text-zinc-500 transition hover:border-emerald-400 hover:text-emerald-600"
          >
            + 画像を追加
          </label>
        )}
      </div>

      <input
        id="jobPostingImageFile"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {clientError && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {clientError}
        </p>
      )}
      {!clientError && uploadMutation.isError && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {serverErrorMessage ??
            "アップロードに失敗しました。時間をおいて再度お試しください。"}
        </p>
      )}
      {uploadMutation.isPending && (
        <p className="mt-2 text-xs text-zinc-500">アップロード中...</p>
      )}
    </section>
  );
}
