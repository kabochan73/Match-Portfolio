"use client";

import { useState } from "react";
import {
  type Certification,
  useCertifications,
  useCreateCertification,
  useDeleteCertification,
  useUpdateCertification,
} from "@/hooks/seeker/useCertifications";
import { CertificationForm } from "./CertificationForm";

// 一覧の1件分。表示中/編集中の切り替えをこのコンポーネント単位のローカルstateで持つ
function CertificationItem({
  certification,
}: {
  certification: Certification;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useUpdateCertification(certification.id);
  const deleteMutation = useDeleteCertification();

  if (isEditing) {
    return (
      <li className="py-3 first:pt-0 last:pb-0">
        <CertificationForm
          defaultValues={{ name: certification.name }}
          submitLabel="更新する"
          isPending={updateMutation.isPending}
          onCancel={() => setIsEditing(false)}
          onSubmit={(values, onError) => {
            updateMutation.mutate(values, {
              onSuccess: () => setIsEditing(false),
              onError,
            });
          }}
        />
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <p className="text-sm text-zinc-900">{certification.name}</p>
      <div className="flex shrink-0 items-center gap-3 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-brand hover:underline"
        >
          編集
        </button>
        <button
          type="button"
          disabled={deleteMutation.isPending}
          onClick={() => deleteMutation.mutate(certification.id)}
          className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          削除
        </button>
      </div>
    </li>
  );
}

export function CertificationSection() {
  const { data: certifications, isLoading, isError } = useCertifications();
  const [showAddForm, setShowAddForm] = useState(false);
  const createMutation = useCreateCertification();

  return (
    <section>
      <h2 className="mb-4 text-sm font-bold text-zinc-900">資格</h2>

      {isLoading && <p className="text-sm text-zinc-500">読み込み中...</p>}
      {isError && (
        <p role="alert" className="text-sm text-red-600">
          資格の取得に失敗しました。
        </p>
      )}

      {certifications &&
        (certifications.length === 0 ? (
          <p className="text-sm text-zinc-500">未登録です</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {certifications.map((certification) => (
              <CertificationItem
                key={certification.id}
                certification={certification}
              />
            ))}
          </ul>
        ))}

      {showAddForm ? (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <CertificationForm
            submitLabel="追加する"
            isPending={createMutation.isPending}
            onCancel={() => setShowAddForm(false)}
            onSubmit={(values, onError) => {
              createMutation.mutate(values, {
                onSuccess: () => setShowAddForm(false),
                onError,
              });
            }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="mt-4 rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-light"
        >
          資格を追加する
        </button>
      )}
    </section>
  );
}
