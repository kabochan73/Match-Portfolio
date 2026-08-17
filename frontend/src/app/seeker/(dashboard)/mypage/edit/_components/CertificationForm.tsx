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
    <form onSubmit={submit} noValidate>
      <div>
        <label htmlFor={`${formId}-name`}>資格名</label>
        <input id={`${formId}-name`} type="text" {...register("name")} />
        {errors.name && <p role="alert">{errors.name.message}</p>}
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
