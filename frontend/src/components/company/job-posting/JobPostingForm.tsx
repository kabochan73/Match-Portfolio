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
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor="title" className="text-sm font-medium text-zinc-700">
          求人タイトル
        </label>
        <input
          id="title"
          type="text"
          {...register("title")}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {errors.title && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="text-sm font-medium text-zinc-700"
        >
          職務内容
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={5}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {errors.description && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="desiredCandidate"
          className="text-sm font-medium text-zinc-700"
        >
          求める人材像
        </label>
        <textarea
          id="desiredCandidate"
          {...register("desiredCandidate")}
          rows={5}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {errors.desiredCandidate && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.desiredCandidate.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="employmentType"
          className="text-sm font-medium text-zinc-700"
        >
          雇用形態
        </label>
        <select
          id="employmentType"
          {...register("employmentType")}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">選択してください</option>
          {Object.entries(employmentTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.employmentType && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.employmentType.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="prefecture"
          className="text-sm font-medium text-zinc-700"
        >
          勤務地
        </label>
        <select
          id="prefecture"
          {...register("prefecture")}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">選択してください</option>
          {JOB_POSTING_PREFECTURES.map((prefecture) => (
            <option key={prefecture} value={prefecture}>
              {prefecture}
            </option>
          ))}
        </select>
        {errors.prefecture && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.prefecture.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="salaryMin"
            className="text-sm font-medium text-zinc-700"
          >
            月給(下限・円)
          </label>
          <input
            id="salaryMin"
            type="number"
            {...register("salaryMin")}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {errors.salaryMin && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.salaryMin.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="salaryMax"
            className="text-sm font-medium text-zinc-700"
          >
            月給(上限・円)
          </label>
          <input
            id="salaryMax"
            type="number"
            {...register("salaryMax")}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {errors.salaryMax && (
            <p role="alert" className="mt-1 text-xs text-red-600">
              {errors.salaryMax.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 border border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
