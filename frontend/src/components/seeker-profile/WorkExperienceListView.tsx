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
    return <p>未登録です</p>;
  }

  return (
    <ul>
      {workExperiences.map((workExperience) => (
        <li key={workExperience.id}>
          <p>
            {workExperience.company_name}(
            {employmentTypeLabels[workExperience.employment_type]})
          </p>
          <p>
            {workExperience.started_on} 〜 {workExperience.ended_on ?? "在籍中"}
          </p>
        </li>
      ))}
    </ul>
  );
}
