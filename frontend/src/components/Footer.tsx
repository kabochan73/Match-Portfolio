// 全ページ共通のフッター。会社情報等は実在しないため、サービス名と説明程度に留めている
export function Footer() {
  return (
    <footer className="bg-linear-to-br from-brand to-sky-600 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <p className="text-lg font-bold">Tech Match 株式会社</p>
          <p className="mt-2 text-sm text-white">
            〒 000-0000 福岡市中央区〇〇〇〇〇〇〇〇
            <br />
            📞 090-0000-0000
          </p>
        </div>

        <div className="mt-8 pt-4 text-center text-sm text-white">
          ©2026 Tech Match
        </div>
      </div>
    </footer>
  );
}
