"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import {
  type EducationValues,
  educationSchema,
} from "@/hooks/seeker/useEducations";

// バックエンドのフィールド名(snake_case) → フォームのフィールド名(camelCase)
const serverFieldMap: Record<string, keyof EducationValues> = {
  school_name: "schoolName",
};

// 学歴の追加・編集フォーム本体。追加/編集どちらもフィールドは同じなので、
// 呼び出し側(EducationSection)がdefaultValuesとonSubmitの中身を出し分けて共用する
export function EducationForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  defaultValues?: EducationValues;
  onSubmit: (
    values: EducationValues,
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
  } = useForm<EducationValues>({
    resolver: zodResolver(educationSchema),
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
        <label htmlFor="schoolName">学校名</label>
        <input id="schoolName" type="text" {...register("schoolName")} />
        {errors.schoolName && <p role="alert">{errors.schoolName.message}</p>}
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
