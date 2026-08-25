import type { Education } from "@/hooks/seeker/useEducations";

// 学歴一覧の表示専用コンポーネント(編集・削除ボタンなし)。
// 自分のマイページ表示と、将来の企業側からの応募者詳細閲覧の両方で使い回す想定
export function EducationListView({ educations }: { educations: Education[] }) {
  if (educations.length === 0) {
    return <p className="text-lg text-zinc-500">未登録です</p>;
  }

  return (
    <ul className="divide-y divide-zinc-400">
      {educations.map((education) => (
        <li
          key={education.id}
          className="py-3 text-lg text-zinc-900 first:pt-0 last:pb-0"
        >
          {education.school_name}
        </li>
      ))}
    </ul>
  );
}
