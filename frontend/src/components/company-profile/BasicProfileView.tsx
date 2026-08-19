import type { CompanyProfile } from "@/hooks/company/useProfile";
import { memberCountRangeLabels } from "@/lib/memberCountRanges";

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
    <dl className="space-y-4">
      <div>
        <dt className="text-xl font-bold text-zinc-800">会社概要</dt>
        <dd className="mt-1 whitespace-pre-wrap text-lg text-zinc-900">
          {profile.description ?? "未設定"}
        </dd>
      </div>

      <div>
        <dt className="text-xl font-bold text-zinc-800">WebサイトURL</dt>
        <dd className="mt-1 text-lg text-zinc-900">
          {profile.website_url ? (
            <a
              href={profile.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-emerald-600 hover:underline"
            >
              {profile.website_url}
            </a>
          ) : (
            "未設定"
          )}
        </dd>
      </div>

      <div>
        <dt className="text-xl font-bold text-zinc-800">設立年</dt>
        <dd className="mt-1 text-lg text-zinc-900">
          {profile.founded_year ?? "未設定"}
        </dd>
      </div>

      <div>
        <dt className="text-xl font-bold text-zinc-800">メンバー数</dt>
        <dd className="mt-1 text-lg text-zinc-900">
          {profile.member_count_range
            ? memberCountRangeLabels[profile.member_count_range]
            : "未設定"}
        </dd>
      </div>

      <div>
        <dt className="text-xl font-bold text-zinc-800">電話番号</dt>
        <dd className="mt-1 text-lg text-zinc-900">
          {profile.phone_number ?? "未設定"}
        </dd>
      </div>
      <div>
        <dt className="text-xl font-bold text-zinc-800">所在地</dt>
        <dd className="mt-1 text-lg text-zinc-900">
          {profile.prefecture
            ? `${profile.prefecture}${profile.address_line ?? ""}`
            : "未設定"}
        </dd>
      </div>
    </dl>
  );
}
