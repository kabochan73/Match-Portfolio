import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Handshake,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";

// 企業向け説明ページ(SC、公開ページ)。トップページの「企業登録はこちら」から遷移し、
// サービスの仕組み・料金を説明した上で企業登録/ログインへ誘導する
export default function Page() {
  return (
    <div className="flex flex-1 flex-col">

      <section className="w-full py-16">
        <div className="mx-auto w-full max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            採用担当者の方へ
          </h1>
          <p className="mx-auto mt-4 max-w-4xl text-xl font-bold leading-relaxed text-zinc-800">
            求人を掲載し、気になる人材にだけ「いいね」を送って始まる採用サービスです。
            <br />
            求人側のいいねの回数を絞ることで、本気度の高いマッチングが出来ます。
            <br />
            求職者側のプロフィールを詳しく見ることで、ミスマッチを防ぐことが出来ます。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/company/register"
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-6 py-3 text-lg font-semibold text-white transition hover:bg-emerald-600 active:translate-y-0.5"
            >
              企業登録はこちら
              <ChevronRight size={22} />
            </Link>
            <Link
              href="/company/login"
              className="inline-flex items-center rounded-full border border-zinc-600 px-6 py-3 text-lg font-bold text-zinc-800 transition-colors hover:bg-zinc-100"
            >
              ログイン
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full bg-zinc-50 py-16">
        <div className="mx-auto w-full max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold text-zinc-900">料金プラン</h2>
          <h3 className="text-xl font-extrabold text-zinc-900 mt-2">
            求人を掲載するための料金です。
            <br />
            企業のプロフィールの設定や、メッセージのやり取りは無料でご利用いただけます。
          </h3>
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg">
            <p className="text-sm font-semibold text-emerald-600">
              月額固定プラン
            </p>
            <p className="mt-2">
              <span className="text-4xl font-extrabold text-zinc-900">
                ¥1,000
              </span>
              <span className="ml-1 text-sm text-zinc-600">/ 月(税込)</span>
            </p>
            <p className="mt-4 text-sm text-zinc-800 font-bold">
              求人掲載数は無制限。掲載期間の制限もありません。
              <br />
              いいねの送信・スカウト・追加課金は一切ありません。
            </p>
          </div>
        </div>
      </section>
     


      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-zinc-900">使い方</h2>
          <div className="mx-auto mt-3 h-1 w-full rounded-full bg-emerald-500" />
        </div>

        <div className="mt-12 flex flex-col items-center gap-10 sm:flex-row sm:items-start sm:justify-center sm:gap-6">
          <div className="w-44 text-center">
            <p className="text-sm font-bold text-emerald-600">01</p>
            <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <FileText className="text-emerald-600" size={26} />
            </div>
            <p className="mt-3 font-semibold text-zinc-900">求人を掲載</p>
            <p className="mt-1 text-sm text-zinc-600">
              自社の求人情報を登録！
            </p>
          </div>

          <ChevronRight
            className="hidden shrink-0 text-zinc-300 sm:mt-9 sm:block"
            size={24}
          />

          <div className="w-44 text-center">
            <p className="text-sm font-bold text-emerald-600">02</p>
            <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <ThumbsUp className="text-emerald-600" size={26} />
            </div>
            <p className="mt-3 font-semibold text-zinc-900">応募が届く</p>
            <p className="mt-1 text-sm text-zinc-600">
              求職者からいいねが届く！
            </p>
          </div>

          <ChevronRight
            className="hidden shrink-0 text-zinc-300 sm:mt-9 sm:block"
            size={24}
          />

          <div className="w-44 text-center">
            <p className="text-sm font-bold text-emerald-600">03</p>
            <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <Handshake className="text-emerald-600" size={26} />
            </div>
            <p className="mt-3 font-semibold text-zinc-900">マッチ</p>
            <p className="mt-1 text-sm text-zinc-600">
              気になる人材にいいね！
            </p>
          </div>

          <ChevronRight
            className="hidden shrink-0 text-zinc-300 sm:mt-9 sm:block"
            size={24}
          />

          <div className="w-44 text-center">
            <p className="text-sm font-bold text-emerald-600">04</p>
            <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <MessageSquare className="text-emerald-600" size={26} />
            </div>
            <p className="mt-3 font-semibold text-zinc-900">求職者とやり取り</p>
            <p className="mt-1 text-sm text-zinc-600">
              後は自由にメッセージ！
            </p>
          </div>
        </div>
      </section>


    </div>
  );
}
