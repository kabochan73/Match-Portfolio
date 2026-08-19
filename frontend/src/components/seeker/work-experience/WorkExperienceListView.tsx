import {
  type WorkExperience,
  employmentTypeLabels,
} from "@/hooks/seeker/useWorkExperiences";

// 職歴一覧の表示専用コンポーネント(編集・削除ボタンなし)。
// 自分のマイページ表示と、将来の企業側からの応募者詳細閲覧の両方で使い回す想定
export function WorkExperienceListView({
  workExperiences,
}: {
  workExperiences: WorkExperience[];
}) {
  if (workExperiences.length === 0) {
    return <p className="text-lg text-zinc-500">未登録です</p>;
  }

  return (
    <ul className="divide-y divide-zinc-100">
      {workExperiences.map((workExperience) => (
        <li key={workExperience.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold text-zinc-900">
              {workExperience.company_name}
            </p>
            <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand">
              {employmentTypeLabels[workExperience.employment_type]}
            </span>
          </div>
          <p className="mt-1 text-lg text-zinc-500">
            {workExperience.started_on} 〜 {workExperience.ended_on ?? "在籍中"}
          </p>
        </li>
      ))}
    </ul>
  );
}
