"use client";

import { useState } from "react";
import {
  type Education,
  useCreateEducation,
  useDeleteEducation,
  useEducations,
  useUpdateEducation,
} from "@/hooks/seeker/useEducations";
import { EducationForm } from "./EducationForm";

// 一覧の1件分。表示中/編集中の切り替えをこのコンポーネント単位のローカルstateで持つ
function EducationItem({ education }: { education: Education }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useUpdateEducation(education.id);
  const deleteMutation = useDeleteEducation();

  if (isEditing) {
    return (
      <li>
        <EducationForm
          defaultValues={{ schoolName: education.school_name }}
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
      <p>{education.school_name}</p>
      <button type="button" onClick={() => setIsEditing(true)}>
        編集
      </button>
      <button
        type="button"
        disabled={deleteMutation.isPending}
        onClick={() => deleteMutation.mutate(education.id)}
      >
        削除
      </button>
    </li>
  );
}

export function EducationSection() {
  const { data: educations, isLoading, isError } = useEducations();
  const [showAddForm, setShowAddForm] = useState(false);
  const createMutation = useCreateEducation();

  return (
    <section>
      <h2>学歴</h2>

      {isLoading && <p>読み込み中...</p>}
      {isError && <p role="alert">学歴の取得に失敗しました。</p>}

      {educations && (
        <ul>
          {educations.map((education) => (
            <EducationItem key={education.id} education={education} />
          ))}
        </ul>
      )}

      {showAddForm ? (
        <EducationForm
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
          学歴を追加する
        </button>
      )}
    </section>
  );
}
