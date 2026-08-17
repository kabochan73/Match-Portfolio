// 企業のロゴ(アバター)表示専用コンポーネント。データ取得は行わず、呼び出し側から
// 値を受け取るだけの純粋な表示コンポーネント。企業自身のプロフィール表示ページと、
// 将来の公開企業ページ(/companies/[id]、未実装)の両方で使い回す想定
export function AvatarView({ avatarUrl }: { avatarUrl: string | null }) {
  if (!avatarUrl) {
    return <p>未設定です</p>;
  }

  // eslint-disable-next-line @next/next/no-img-element -- 外部(Laravelのpublic disk)から配信される画像なのでnext/imageの最適化対象外
  return <img src={avatarUrl} alt="ロゴ画像" width={120} />;
}
