"use client";

import { useState } from "react";
import {
  type WorkExperience,
  employmentTypeLabels,
  useCreateWorkExperience,
  useDeleteWorkExperience,
  useUpdateWorkExperience,
  useWorkExperiences,
} from "@/hooks/seeker/useWorkExperiences";
import { WorkExperienceForm } from "./WorkExperienceForm";

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
      <li className="py-3 first:pt-0 last:pb-0">
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
    <li className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-zinc-900">
            {workExperience.company_name}
          </p>
          <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand">
            {employmentTypeLabels[workExperience.employment_type]}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {workExperience.started_on} 〜 {workExperience.ended_on ?? "在籍中"}
        </p>
      </div>
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
          onClick={() => deleteMutation.mutate(workExperience.id)}
          className="text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          削除
        </button>
      </div>
    </li>
  );
}

export function WorkExperienceSection() {
  const { data: workExperiences, isLoading, isError } = useWorkExperiences();
  const [showAddForm, setShowAddForm] = useState(false);
  const createMutation = useCreateWorkExperience();

  return (
    <section>
      <h2 className="mb-4 text-sm font-bold text-zinc-900">職歴</h2>

      {isLoading && <p className="text-sm text-zinc-500">読み込み中...</p>}
      {isError && (
        <p role="alert" className="text-sm text-red-600">
          職歴の取得に失敗しました。
        </p>
      )}

      {workExperiences &&
        (workExperiences.length === 0 ? (
          <p className="text-sm text-zinc-500">未登録です</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {workExperiences.map((workExperience) => (
              <WorkExperienceItem
                key={workExperience.id}
                workExperience={workExperience}
              />
            ))}
          </ul>
        ))}

      {showAddForm ? (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
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
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="mt-4 rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-light"
        >
          職歴を追加する
        </button>
      )}
    </section>
  );
}
