"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import {
  JOB_POSTING_PREFECTURES,
  type JobPostingValues,
  employmentTypeLabels,
  jobPostingSchema,
} from "@/hooks/company/useJobPostings";

// バックエンドのフィールド名(snake_case) → フォームのフィールド名(camelCase)
const serverFieldMap: Record<string, keyof JobPostingValues> = {
  title: "title",
  description: "description",
  desired_candidate: "desiredCandidate",
  employment_type: "employmentType",
  prefecture: "prefecture",
  salary_min: "salaryMin",
  salary_max: "salaryMax",
};

// 求人の投稿・編集フォーム本体。job-postings/newとjob-postings/[id]の両方から
// 呼ばれる(同時に2つマウントされることはないルート構成のため、WorkExperienceFormの
// ようなuseId()での id 衝突対策は不要)
export function JobPostingForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
}: {
  defaultValues?: JobPostingValues;
  onSubmit: (
    values: JobPostingValues,
    onError: (error: unknown) => void,
  ) => void;
  isPending: boolean;
  submitLabel: string;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<JobPostingValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues,
  });

  const handleServerError = (error: unknown) => {
    if (error instanceof ApiValidationError) {
      for (const [field, messages] of Object.entries(error.errors)) {
        const formField = serverFieldMap[field];
        if (formField && messages[0]) {
          setError(formField, { type: "server", message: messages[0] });
        }
      }
    }
  };

  const submit = handleSubmit((values) => {
    onSubmit(values, handleServerError);
  });

  return (
    <form onSubmit={submit} noValidate>
      <div>
        <label htmlFor="title">求人タイトル</label>
        <input id="title" type="text" {...register("title")} />
        {errors.title && <p role="alert">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description">職務内容</label>
        <textarea id="description" {...register("description")} />
        {errors.description && <p role="alert">{errors.description.message}</p>}
      </div>

      <div>
        <label htmlFor="desiredCandidate">求める人材像</label>
        <textarea id="desiredCandidate" {...register("desiredCandidate")} />
        {errors.desiredCandidate && (
          <p role="alert">{errors.desiredCandidate.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="employmentType">雇用形態</label>
        <select id="employmentType" {...register("employmentType")}>
          <option value="">選択してください</option>
          {Object.entries(employmentTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.employmentType && (
          <p role="alert">{errors.employmentType.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="prefecture">勤務地</label>
        <select id="prefecture" {...register("prefecture")}>
          <option value="">選択してください</option>
          {JOB_POSTING_PREFECTURES.map((prefecture) => (
            <option key={prefecture} value={prefecture}>
              {prefecture}
            </option>
          ))}
        </select>
        {errors.prefecture && <p role="alert">{errors.prefecture.message}</p>}
      </div>

      <div>
        <label htmlFor="salaryMin">月給(下限・円)</label>
        <input id="salaryMin" type="number" {...register("salaryMin")} />
        {errors.salaryMin && <p role="alert">{errors.salaryMin.message}</p>}
      </div>

      <div>
        <label htmlFor="salaryMax">月給(上限・円)</label>
        <input id="salaryMax" type="number" {...register("salaryMax")} />
        {errors.salaryMax && <p role="alert">{errors.salaryMax.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting || isPending}>
        {submitLabel}
      </button>
    </form>
  );
}
