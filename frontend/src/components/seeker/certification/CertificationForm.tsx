"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { ApiValidationError } from "@/lib/api/client";
import {
  type CertificationValues,
  certificationSchema,
} from "@/hooks/seeker/useCertifications";

// 資格の追加・編集フォーム本体。追加/編集どちらもフィールドは同じなので、
// 呼び出し側(CertificationSection)がdefaultValuesとonSubmitの中身を出し分けて共用する
export function CertificationForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  defaultValues?: CertificationValues;
  onSubmit: (
    values: CertificationValues,
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
  } = useForm<CertificationValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues,
  });
  // 一覧の複数行を同時に編集状態にする(=このフォームが複数同時にマウントされる)と
  // 素のidだと衝突するため、コンポーネントインスタンスごとに一意なidを付与する
  // (基本プロフィールフォームのid="name"との衝突もこれで併せて解消する)
  const formId = useId();

  const handleServerError = (error: unknown) => {
    // フォームのフィールド名(name)がバックエンドのフィールド名と一致するため、
    // 職歴・学歴フォームと違いsnake_case⇔camelCaseのマッピングは不要
    if (error instanceof ApiValidationError && error.errors.name?.[0]) {
      setError("name", { type: "server", message: error.errors.name[0] });
    }
  };

  const submit = handleSubmit((values) => {
    onSubmit(values, handleServerError);
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label
          htmlFor={`${formId}-name`}
          className="text-sm font-medium text-zinc-700"
        >
          資格名
        </label>
        <input
          id={`${formId}-name`}
          type="text"
          {...register("name")}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {errors.name && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.name.message}
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
