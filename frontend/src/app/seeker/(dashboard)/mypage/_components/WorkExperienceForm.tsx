"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import {
  type WorkExperienceValues,
  workExperienceSchema,
} from "@/hooks/seeker/useWorkExperiences";

// バックエンドのフィールド名(snake_case) → フォームのフィールド名(camelCase)
const serverFieldMap: Record<string, keyof WorkExperienceValues> = {
  company_name: "companyName",
  started_on: "startedOn",
  ended_on: "endedOn",
  employment_type: "employmentType",
};

// 職歴の追加・編集フォーム本体。追加/編集どちらもフィールドは同じなので、
// 呼び出し側(WorkExperienceSection)がdefaultValuesとonSubmitの中身を出し分けて共用する
export function WorkExperienceForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  defaultValues?: WorkExperienceValues;
  onSubmit: (
    values: WorkExperienceValues,
    onError: (error: unknown) => void,
  ) => void;
  onCancel?: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WorkExperienceValues>({
    resolver: zodResolver(workExperienceSchema),
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
        <label htmlFor="companyName">会社名</label>
        <input id="companyName" type="text" {...register("companyName")} />
        {errors.companyName && <p role="alert">{errors.companyName.message}</p>}
      </div>

      <div>
        <label htmlFor="employmentType">雇用形態</label>
        <select id="employmentType" {...register("employmentType")}>
          <option value="">選択してください</option>
          <option value="full_time">正社員</option>
          <option value="contract">契約社員</option>
          <option value="part_time">アルバイト</option>
        </select>
        {errors.employmentType && (
          <p role="alert">{errors.employmentType.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="startedOn">在籍開始年月日</label>
        <input id="startedOn" type="date" {...register("startedOn")} />
        {errors.startedOn && <p role="alert">{errors.startedOn.message}</p>}
      </div>

      <div>
        <label htmlFor="endedOn">在籍終了年月日(在籍中は空欄)</label>
        <input id="endedOn" type="date" {...register("endedOn")} />
        {errors.endedOn && <p role="alert">{errors.endedOn.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting || isPending}>
        {submitLabel}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel}>
          キャンセル
        </button>
      )}
    </form>
  );
}
