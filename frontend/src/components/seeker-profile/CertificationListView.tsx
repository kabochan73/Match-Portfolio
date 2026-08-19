import type { Certification } from "@/hooks/seeker/useCertifications";

// 資格一覧の表示専用コンポーネント(編集・削除ボタンなし)。
// 自分のマイページ表示と、将来の企業側からの応募者詳細閲覧の両方で使い回す想定
export function CertificationListView({
  certifications,
}: {
  certifications: Certification[];
}) {
  if (certifications.length === 0) {
    return <p className="text-lg text-zinc-500">未登録です</p>;
  }

  return (
    <ul className="divide-y divide-zinc-100">
      {certifications.map((certification) => (
        <li
          key={certification.id}
          className="py-3 text-lg text-zinc-900 first:pt-0 last:pb-0"
        >
          {certification.name}
        </li>
      ))}
    </ul>
  );
}
