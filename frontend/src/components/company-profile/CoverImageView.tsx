// 企業ホーム画面のカバー画像の表示専用コンポーネント。AvatarViewと同じ理由・同じ形で
// データ取得を持たない純粋な表示コンポーネントにしてある
export function CoverImageView({
  coverImageUrl,
}: {
  coverImageUrl: string | null;
}) {
  if (!coverImageUrl) {
    return <p>未設定です</p>;
  }

  // eslint-disable-next-line @next/next/no-img-element -- 外部(Laravelのpublic disk)から配信される画像なのでnext/imageの最適化対象外
  return <img src={coverImageUrl} alt="カバー画像" width={480} />;
}
