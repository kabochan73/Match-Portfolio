// 求職者のアバター表示専用コンポーネント。データ取得は行わず、呼び出し側から
// 値を受け取るだけの純粋な表示コンポーネント。自分のマイページ表示(SC/CC区分は
// 呼び出し側次第)と、将来の企業側からの応募者詳細閲覧の両方で使い回す想定
export function AvatarView({ avatarUrl }: { avatarUrl: string | null }) {
  if (!avatarUrl) {
    return (
      <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs text-zinc-400">
        未設定
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- 外部(Laravelのpublic disk)から配信される画像なのでnext/imageの最適化対象外
  return (
    <img
      src={avatarUrl}
      alt="プロフィール画像"
      width={96}
      height={96}
      className="size-24 shrink-0 rounded-full border border-zinc-200 object-cover"
    />
  );
}
