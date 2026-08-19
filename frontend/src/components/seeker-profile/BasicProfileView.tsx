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
    <dl className="space-y-4">
      <div>
        <dt className="text-xs font-medium text-zinc-500">氏名</dt>
        <dd className="mt-1 text-sm text-zinc-900">{profile.name}</dd>
      </div>

      <div>
        <dt className="text-xs font-medium text-zinc-500">生年月日</dt>
        <dd className="mt-1 text-sm text-zinc-900">{profile.birth_date}</dd>
      </div>

      <div>
        <dt className="text-xs font-medium text-zinc-500">自己紹介コメント</dt>
        <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">
          {profile.comment ?? "未設定"}
        </dd>
      </div>

      <div>
        <dt className="text-xs font-medium text-zinc-500">ポートフォリオURL</dt>
        <dd className="mt-1 text-sm text-zinc-900">
          {profile.portfolio_url ? (
            <a
              href={profile.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-brand hover:underline"
            >
              {profile.portfolio_url}
            </a>
          ) : (
            "未設定"
          )}
        </dd>
      </div>
    </dl>
  );
}
