import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  FileHeart,
  Handshake,
  Mail,
  User,
  UserPlus,
} from "lucide-react";

const steps = [
  { icon: UserPlus, title: "会員登録", description: "プロフィールを登録！" },
  { icon: FileHeart, title: "求人に応募", description: "気になる求人にいいね！" },
  { icon: Handshake, title: "マッチ", description: "企業からいいねでマッチ！" },
  { icon: Mail, title: "企業とやり取り", description: "後は自由にメッセージ！" },
] as const;

// トップページ。求人一覧・検索は/jobsに完結させ、
// ここではサービス説明とログイン・新規登録の導線のみを置く
export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative h-128 overflow-hidden sm:h-144">
        <Image
          src="/hero.jpg"
          alt="ノートPCを持つエンジニア"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[85%_top]"
        />
        <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col justify-center px-4">
          <div className="max-w-lg">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
              Tech Match
            </h1>
            <p className="mt-4 text-lg font-bold text-zinc-800">
              エンジニアと企業のミスマッチを防ぐ、
              <br />
              シンプルな求人マッチングサービス
            </p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-700">
              求職者はプロフィールを細かく登録し、企業に応募！
              <br />
              企業は求人を掲載して自社に合った人材とだけマッチ！
            </p>
            <Link
              href="/jobs"
              className="mt-8 inline-flex w-fit rounded-full items-center gap-1 bg-brand px-6 py-3 text-xl font-semibold text-white transition hover:bg-sky-600 active:translate-y-0.5"
            >
              求人を探す
              <ChevronRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full py-16">
        <div className="mx-auto w-full max-w-5xl px-4 text-center">
          <h2 className="text-4xl font-bold text-zinc-900">Tech Matchとは</h2>
          <div className="text-left font-bold text-zinc-800">
            <p className="mt-4 text-lg">
              いいねを一次面接とすることで、企業と求職者のミスマッチを防ぐことを目的とした求人マッチングサービスです。
              <br />
              お互い、採用の可能性が低い相手に時間を割く必要がないので、効率的に採用活動・転職活動を行うことができます！
            </p>
            <p className="mt-4 text-lg">
              さらに、いいね出来る回数を毎月１０回に制限することで、求職者が本当に興味のある相手にだけいいねを送るようになり、本気度の高いマッチングが可能になります！
            </p>
            <p className="mt-6 text-sm">
              ※ いいねは毎月復活します。企業側のいいねは無制限です。
              <br />
              ※ 毎月１つだけの特別なスーパーいいねもあります。
              <br />
              ※ 企業側からのスカウトは一切ありません。いいねの購入もありません。
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-sky-50 py-8">
        <div className="mx-auto grid w-full max-w-4xl px-4 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-lg">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-light">
              <User className="text-brand" size={28} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-zinc-900">
              求職者の方へ
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              プロフィールを細かく登録し、
              <br />
              気になる企業に応募しましょう。
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link
                href="/seeker/register"
                className="inline-flex items-center gap-1 rounded-full border border-sky-600 px-6 py-2 text-sm font-semibold text-brand transition-colors hover:bg-sky-50"
              >
                求職者登録(無料)
                <ChevronRight size={24} />
              </Link>
              <Link
                href="/seeker/login"
                className="rounded-full border border-zinc-600 px-6 py-2 text-sm text-zinc-800 font-bold transition-colors hover:bg-zinc-100"
              >
                ログイン
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-lg">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <Building2 className="text-emerald-600" size={28} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-zinc-900">企業の方へ</h2>
            <p className="mt-2 text-sm text-zinc-600">
              求人を掲載して、
              <br/>
              自社に合った人材とマッチしましょう。
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link
                href="/company/explanation"
                className="inline-flex items-center gap-1 rounded-full border border-emerald-600 px-6 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
              >
                企業登録はこちら
                <ChevronRight size={24} />
              </Link>
              <Link
                href="/company/login"
                className="rounded-full border border-zinc-600 px-6 py-2 text-sm font-bold text-zinc-800 transition-colors hover:bg-zinc-100"
              >
                ログイン
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="mt-2 text-xl font-bold text-zinc-900">
            求職者の方の使い方
          </h2>
          <div className="mx-auto mt-3 h-1 w-full rounded-full bg-brand" />
        </div>

        <div className="mt-12 flex flex-col items-center gap-10 sm:flex-row sm:items-start sm:justify-center sm:gap-6">
          {steps.map((step, index) => (
            <Fragment key={step.title}>
              {index > 0 && (
                <ChevronRight
                  className="hidden shrink-0 text-zinc-300 sm:mt-9 sm:block"
                  size={24}
                />
              )}
              <div className="w-44 text-center">
                <p className="text-sm font-bold text-brand">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-brand-light">
                  <step.icon className="text-brand" size={26} />
                </div>
                <p className="mt-3 font-semibold text-zinc-900">
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  {step.description}
                </p>
              </div>
            </Fragment>
          ))}
        </div>
      </section>
    </div>
  );
}
