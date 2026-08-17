import type { Certification } from "@/hooks/seeker/useCertifications";

// 資格一覧の表示専用コンポーネント(編集・削除ボタンなし)。
// 自分のマイページ表示と、将来の企業側からの応募者詳細閲覧の両方で使い回す想定
export function CertificationListView({
  certifications,
}: {
  certifications: Certification[];
}) {
  if (certifications.length === 0) {
    return <p>未登録です</p>;
  }

  return (
    <ul>
      {certifications.map((certification) => (
        <li key={certification.id}>{certification.name}</li>
      ))}
    </ul>
  );
}
