"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

// バックエンドのEducationモデルのJSON表現
export type Education = {
  id: number;
  school_name: string;
};

// 作成・更新の両方で使うフォームのスキーマ(バックエンドのEducationRequestが
// store/updateで共用なのと同じ理由)
export const educationSchema = z.object({
  schoolName: z.string().min(1, "学校名を入力してください").max(255),
});

export type EducationValues = z.infer<typeof educationSchema>;

// 一覧・作成・更新・削除の全フックで共有するクエリキー(作成/更新/削除の
// onSuccessでこのキーをinvalidateして一覧を再取得させる)
export const educationsQueryKey = ["seeker", "educations"] as const;

export function useEducations() {
  return useQuery({
    queryKey: educationsQueryKey,
    queryFn: () => apiFetch<Education[]>("/api/profile/educations"),
    // 自分の操作(作成・更新・削除)でしか変わらず、その際はinvalidateQueriesで
    // 追従済みのため、マウントの度の再取得は不要
    staleTime: 5 * 60 * 1000,
  });
}

function toRequestBody(values: EducationValues) {
  return {
    school_name: values.schoolName,
  };
}

export function useCreateEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: EducationValues) =>
      apiFetch<Education>("/api/profile/educations", {
        method: "POST",
        body: toRequestBody(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: educationsQueryKey });
    },
  });
}

export function useUpdateEducation(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: EducationValues) =>
      apiFetch<Education>(`/api/profile/educations/${id}`, {
        method: "PUT",
        body: toRequestBody(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: educationsQueryKey });
    },
  });
}

export function useDeleteEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/profile/educations/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: educationsQueryKey });
    },
  });
}
