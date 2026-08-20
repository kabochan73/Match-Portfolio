"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import {
  type JobPosting,
  type JobPostingImage,
  jobPostingQueryKey,
} from "@/hooks/company/useJobPostings";

// 求人画像の登録。バックエンドはmultipart/form-dataの"image"フィールドを1枚だけ受け取り、
// 追加した画像1件分(position込み)を返す(POST /api/company/job-postings/{id}/images)。
// job_posting_images配列を持つ求人本体のキャッシュにその場で追記し、再取得を待たずに一覧へ反映する
export function useUploadJobPostingImage(jobPostingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return apiFetch<JobPostingImage>(
        `/api/company/job-postings/${jobPostingId}/images`,
        { method: "POST", body: formData },
      );
    },
    onSuccess: (created) => {
      queryClient.setQueryData<JobPosting>(
        jobPostingQueryKey(jobPostingId),
        (old) =>
          old
            ? {
                ...old,
                job_posting_images: [
                  ...(old.job_posting_images ?? []),
                  created,
                ],
              }
            : old,
      );
    },
  });
}

export function useDeleteJobPostingImage(jobPostingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: number) =>
      apiFetch<void>(
        `/api/company/job-postings/${jobPostingId}/images/${imageId}`,
        { method: "DELETE" },
      ),
    onSuccess: (_, imageId) => {
      queryClient.setQueryData<JobPosting>(
        jobPostingQueryKey(jobPostingId),
        (old) =>
          old
            ? {
                ...old,
                job_posting_images: old.job_posting_images?.filter(
                  (image) => image.id !== imageId,
                ),
              }
            : old,
      );
    },
  });
}
