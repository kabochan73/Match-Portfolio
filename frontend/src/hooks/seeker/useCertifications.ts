"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

// バックエンドのCertificationモデルのJSON表現
export type Certification = {
  id: number;
  name: string;
};

// 作成・更新の両方で使うフォームのスキーマ(バックエンドのCertificationRequestが
// store/updateで共用なのと同じ理由)。同一資格の重複はクライアント側では判定せず、
// バックエンドのunique制約による422エラーをそのまま表示する
export const certificationSchema = z.object({
  name: z.string().min(1, "資格名を入力してください").max(255),
});

export type CertificationValues = z.infer<typeof certificationSchema>;

// 一覧・作成・更新・削除の全フックで共有するクエリキー(作成/更新/削除の
// onSuccessでこのキーをinvalidateして一覧を再取得させる)
export const certificationsQueryKey = ["seeker", "certifications"] as const;

export function useCertifications() {
  return useQuery({
    queryKey: certificationsQueryKey,
    queryFn: () => apiFetch<Certification[]>("/api/profile/certifications"),
  });
}

export function useCreateCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CertificationValues) =>
      apiFetch<Certification>("/api/profile/certifications", {
        method: "POST",
        body: values,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificationsQueryKey });
    },
  });
}

export function useUpdateCertification(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CertificationValues) =>
      apiFetch<Certification>(`/api/profile/certifications/${id}`, {
        method: "PUT",
        body: values,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificationsQueryKey });
    },
  });
}

export function useDeleteCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/profile/certifications/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificationsQueryKey });
    },
  });
}
