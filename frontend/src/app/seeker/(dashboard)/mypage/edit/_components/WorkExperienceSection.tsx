"use client";

import { useState } from "react";
import {
  type EmploymentType,
  type WorkExperience,
  useCreateWorkExperience,
  useDeleteWorkExperience,
  useUpdateWorkExperience,
  useWorkExperiences,
} from "@/hooks/seeker/useWorkExperiences";
import { WorkExperienceForm } from "./WorkExperienceForm";

const employmentTypeLabels: Record<EmploymentType, string> = {
  full_time: "正社員",
  contract: "契約社員",
  part_time: "アルバイト",
};

// 一覧の1件分。表示中/編集中の切り替えをこのコンポーネント単位のローカルstateで持つ
function WorkExperienceItem({
  workExperience,
}: {
  workExperience: WorkExperience;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useUpdateWorkExperience(workExperience.id);
  const deleteMutation = useDeleteWorkExperience();

  if (isEditing) {
    return (
      <li>
        <WorkExperienceForm
          defaultValues={{
            companyName: workExperience.company_name,
            startedOn: workExperience.started_on,
            endedOn: workExperience.ended_on ?? "",
            employmentType: workExperience.employment_type,
          }}
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
      <p>
        {workExperience.company_name}(
        {employmentTypeLabels[workExperience.employment_type]})
      </p>
      <p>
        {workExperience.started_on} 〜 {workExperience.ended_on ?? "在籍中"}
      </p>
      <button type="button" onClick={() => setIsEditing(true)}>
        編集
      </button>
      <button
        type="button"
        disabled={deleteMutation.isPending}
        onClick={() => deleteMutation.mutate(workExperience.id)}
      >
        削除
      </button>
    </li>
  );
}

export function WorkExperienceSection() {
  const { data: workExperiences, isLoading, isError } = useWorkExperiences();
  const [showAddForm, setShowAddForm] = useState(false);
  const createMutation = useCreateWorkExperience();

  return (
    <section>
      <h2>職歴</h2>

      {isLoading && <p>読み込み中...</p>}
      {isError && <p role="alert">職歴の取得に失敗しました。</p>}

      {workExperiences && (
        <ul>
          {workExperiences.map((workExperience) => (
            <WorkExperienceItem
              key={workExperience.id}
              workExperience={workExperience}
            />
          ))}
        </ul>
      )}

      {showAddForm ? (
        <WorkExperienceForm
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
          職歴を追加する
        </button>
      )}
    </section>
  );
}
