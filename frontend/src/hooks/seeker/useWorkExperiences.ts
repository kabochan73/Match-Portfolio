"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";

// バックエンドのwork_experiences.employment_typeのCHECK制約と対応する区分
export type EmploymentType = "full_time" | "part_time" | "contract";

// バックエンドのWorkExperienceモデルのJSON表現
export type WorkExperience = {
  id: number;
  company_name: string;
  started_on: string;
  // 在籍中の場合はnull
  ended_on: string | null;
  employment_type: EmploymentType;
};

// 作成・更新の両方で使うフォームのスキーマ(バックエンドのWorkExperienceRequestが
// store/updateで共用なのと同じ理由)
export const workExperienceSchema = z.object({
  companyName: z.string().min(1, "会社名を入力してください").max(255),
  startedOn: z.string().min(1, "在籍開始年月を入力してください"),
  // 空文字は「在籍中」を表す(バックエンドにはnullで送る)
  endedOn: z.string().optional(),
  employmentType: z.enum(["full_time", "part_time", "contract"], {
    error: "雇用形態を選択してください",
  }),
});

export type WorkExperienceValues = z.infer<typeof workExperienceSchema>;

// 一覧・作成・更新・削除の全フックで共有するクエリキー(作成/更新/削除の
// onSuccessでこのキーをinvalidateして一覧を再取得させる)
export const workExperiencesQueryKey = ["seeker", "workExperiences"] as const;

// この職歴リソースに関する一覧取得・作成・更新・削除のフックをまとめて1ファイルに置く
// (会社名・雇用形態などのフォームスキーマや型を4ファイルに分散させたくないため)

export function useWorkExperiences() {
  return useQuery({
    queryKey: workExperiencesQueryKey,
    queryFn: () => apiFetch<WorkExperience[]>("/api/profile/work-experiences"),
  });
}

function toRequestBody(values: WorkExperienceValues) {
  return {
    company_name: values.companyName,
    started_on: values.startedOn,
    ended_on: values.endedOn || null,
    employment_type: values.employmentType,
  };
}

export function useCreateWorkExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: WorkExperienceValues) =>
      apiFetch<WorkExperience>("/api/profile/work-experiences", {
        method: "POST",
        body: toRequestBody(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workExperiencesQueryKey });
    },
  });
}

export function useUpdateWorkExperience(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: WorkExperienceValues) =>
      apiFetch<WorkExperience>(`/api/profile/work-experiences/${id}`, {
        method: "PUT",
        body: toRequestBody(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workExperiencesQueryKey });
    },
  });
}

export function useDeleteWorkExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/profile/work-experiences/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workExperiencesQueryKey });
    },
  });
}
