"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
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
  // 一覧の複数行を同時に編集状態にする(=このフォームが複数同時にマウントされる)と
  // 素のidだと衝突するため、コンポーネントインスタンスごとに一意なidを付与する
  const formId = useId();

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
        <label
          htmlFor={`${formId}-schoolName`}
          className="text-sm font-medium text-zinc-700"
        >
          学校名
        </label>
        <input
          id={`${formId}-schoolName`}
          type="text"
          {...register("schoolName")}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {errors.schoolName && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.schoolName.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
