import type { Education } from "@/hooks/seeker/useEducations";

// 学歴一覧の表示専用コンポーネント(編集・削除ボタンなし)。
// 自分のマイページ表示と、将来の企業側からの応募者詳細閲覧の両方で使い回す想定
export function EducationListView({ educations }: { educations: Education[] }) {
  if (educations.length === 0) {
    return <p>未登録です</p>;
  }

  return (
    <ul>
      {educations.map((education) => (
        <li key={education.id}>{education.school_name}</li>
      ))}
    </ul>
  );
}
