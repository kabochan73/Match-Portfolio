// 企業ホーム画面のカバー画像の表示専用コンポーネント。AvatarViewと同じ理由・同じ形で
// データ取得を持たない純粋な表示コンポーネントにしてある
export function CoverImageView({
  coverImageUrl,
}: {
  coverImageUrl: string | null;
}) {
  if (!coverImageUrl) {
    return (
      <div className="flex aspect-[2/1] w-full items-center justify-center bg-zinc-100 text-sm text-zinc-400">
        未設定
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- 外部(Laravelのpublic disk)から配信される画像なのでnext/imageの最適化対象外
  return (
    <img
      src={coverImageUrl}
      alt="カバー画像"
      className="aspect-[2/1] w-full  object-cover justify-center"
    />
  );
}
