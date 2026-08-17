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
      <li>
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
    <li>
      <p>{certification.name}</p>
      <button type="button" onClick={() => setIsEditing(true)}>
        編集
      </button>
      <button
        type="button"
        disabled={deleteMutation.isPending}
        onClick={() => deleteMutation.mutate(certification.id)}
      >
        削除
      </button>
    </li>
  );
}

export function CertificationSection() {
  const { data: certifications, isLoading, isError } = useCertifications();
  const [showAddForm, setShowAddForm] = useState(false);
  const createMutation = useCreateCertification();

  return (
    <section>
      <h2>資格</h2>

      {isLoading && <p>読み込み中...</p>}
      {isError && <p role="alert">資格の取得に失敗しました。</p>}

      {certifications && (
        <ul>
          {certifications.map((certification) => (
            <CertificationItem
              key={certification.id}
              certification={certification}
            />
          ))}
        </ul>
      )}

      {showAddForm ? (
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
      ) : (
        <button type="button" onClick={() => setShowAddForm(true)}>
          資格を追加する
        </button>
      )}
    </section>
  );
}
