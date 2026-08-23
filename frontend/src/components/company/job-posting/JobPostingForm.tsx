"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import { buttonClass } from "@/components/button/buttonClass";
import { FormField, formInputClass } from "@/components/form/FormField";
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
    <form onSubmit={submit} noValidate className="space-y-4">
      <FormField htmlFor="title" label="求人タイトル" error={errors.title?.message}>
        <input
          id="title"
          type="text"
          {...register("title")}
          className={formInputClass("emerald")}
        />
      </FormField>

      <FormField
        htmlFor="description"
        label="職務内容"
        error={errors.description?.message}
      >
        <textarea
          id="description"
          {...register("description")}
          rows={5}
          className={formInputClass("emerald")}
        />
      </FormField>

      <FormField
        htmlFor="desiredCandidate"
        label="求める人材像"
        error={errors.desiredCandidate?.message}
      >
        <textarea
          id="desiredCandidate"
          {...register("desiredCandidate")}
          rows={5}
          className={formInputClass("emerald")}
        />
      </FormField>

      <FormField
        htmlFor="employmentType"
        label="雇用形態"
        error={errors.employmentType?.message}
      >
        <select
          id="employmentType"
          {...register("employmentType")}
          className={formInputClass("emerald")}
        >
          <option value="">選択してください</option>
          {Object.entries(employmentTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        htmlFor="prefecture"
        label="勤務地"
        error={errors.prefecture?.message}
      >
        <select
          id="prefecture"
          {...register("prefecture")}
          className={formInputClass("emerald")}
        >
          <option value="">選択してください</option>
          {JOB_POSTING_PREFECTURES.map((prefecture) => (
            <option key={prefecture} value={prefecture}>
              {prefecture}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          htmlFor="salaryMin"
          label="月給(下限・円)"
          error={errors.salaryMin?.message}
        >
          <input
            id="salaryMin"
            type="number"
            {...register("salaryMin")}
            className={formInputClass("emerald")}
          />
        </FormField>

        <FormField
          htmlFor="salaryMax"
          label="月給(上限・円)"
          error={errors.salaryMax?.message}
        >
          <input
            id="salaryMax"
            type="number"
            {...register("salaryMax")}
            className={formInputClass("emerald")}
          />
        </FormField>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className={buttonClass("outline", "emerald")}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
