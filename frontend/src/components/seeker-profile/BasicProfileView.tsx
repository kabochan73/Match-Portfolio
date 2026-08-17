import type { SeekerProfile } from "@/hooks/seeker/useProfile";

// 基本プロフィール(氏名・生年月日・自己紹介コメント・ポートフォリオURL)の
// 表示専用コンポーネント。SeekerProfileをそのまま渡せるようにし、
// 呼び出し側でのフィールド取り出しの手間を減らす
export function BasicProfileView({
  profile,
}: {
  profile: Pick<
    SeekerProfile,
    "name" | "birth_date" | "comment" | "portfolio_url"
  >;
}) {
  return (
    <dl>
      <dt>氏名</dt>
      <dd>{profile.name}</dd>

      <dt>生年月日</dt>
      <dd>{profile.birth_date}</dd>

      <dt>自己紹介コメント</dt>
      <dd>{profile.comment ?? "未設定"}</dd>

      <dt>ポートフォリオURL</dt>
      <dd>
        {profile.portfolio_url ? (
          <a
            href={profile.portfolio_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {profile.portfolio_url}
          </a>
        ) : (
          "未設定"
        )}
      </dd>
    </dl>
  );
}
