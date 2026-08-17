import {
  type CompanyProfile,
  memberCountRangeLabels,
} from "@/hooks/company/useProfile";

// 基本プロフィール(会社名・会社概要・電話番号・所在地・設立年・メンバー数・
// WebサイトURL)の表示専用コンポーネント
export function BasicProfileView({
  profile,
}: {
  profile: Pick<
    CompanyProfile,
    | "name"
    | "description"
    | "phone_number"
    | "prefecture"
    | "address_line"
    | "founded_year"
    | "member_count_range"
    | "website_url"
  >;
}) {
  return (
    <dl>
      <dt>会社名</dt>
      <dd>{profile.name}</dd>

      <dt>会社概要</dt>
      <dd>{profile.description ?? "未設定"}</dd>

      <dt>電話番号</dt>
      <dd>{profile.phone_number ?? "未設定"}</dd>

      <dt>所在地</dt>
      <dd>
        {profile.prefecture
          ? `${profile.prefecture}${profile.address_line ?? ""}`
          : "未設定"}
      </dd>

      <dt>設立年</dt>
      <dd>{profile.founded_year ?? "未設定"}</dd>

      <dt>メンバー数</dt>
      <dd>
        {profile.member_count_range
          ? memberCountRangeLabels[profile.member_count_range]
          : "未設定"}
      </dd>

      <dt>WebサイトURL</dt>
      <dd>
        {profile.website_url ? (
          <a
            href={profile.website_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {profile.website_url}
          </a>
        ) : (
          "未設定"
        )}
      </dd>
    </dl>
  );
}
