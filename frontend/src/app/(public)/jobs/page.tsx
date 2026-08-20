import Link from "next/link";
import {
  JOB_POSTING_PREFECTURES,
  employmentTypeLabels,
  searchJobPostings,
} from "@/lib/jobPostings";

// SC。searchParamsで絞り込む予定のため、このページ自体はISR対象外(常に動的レンダリング)。
// 検索フォームはJS不要のGET<form>で実装し、CCにする必要をなくしている
export default async function Page(props: PageProps<"/jobs">) {
  const searchParams = await props.searchParams;
  const keyword =
    typeof searchParams.keyword === "string" ? searchParams.keyword : "";
  const prefecture =
    typeof searchParams.prefecture === "string" ? searchParams.prefecture : "";
  const employmentType =
    typeof searchParams.employment_type === "string"
      ? searchParams.employment_type
      : "";
  const pageParam =
    typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const result = await searchJobPostings({
    keyword,
    prefecture,
    employment_type: employmentType,
    page,
  });

  // ページネーションリンクで検索条件を維持するためのクエリ文字列を組み立てる
  function buildPageHref(targetPage: number) {
    const query = new URLSearchParams();
    if (keyword) query.set("keyword", keyword);
    if (prefecture) query.set("prefecture", prefecture);
    if (employmentType) query.set("employment_type", employmentType);
    if (targetPage > 1) query.set("page", String(targetPage));

    const queryString = query.toString();
    return `/jobs${queryString ? `?${queryString}` : ""}`;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4">
      <form
        method="get"
        className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      >
        <div className="min-w-40 flex-1">
          <label
            htmlFor="keyword"
            className="text-sm font-medium text-zinc-700"
          >
            キーワード
          </label>
          <input
            id="keyword"
            name="keyword"
            type="text"
            defaultValue={keyword}
            placeholder="職種・言語など"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div className="w-40">
          <label
            htmlFor="prefecture"
            className="text-sm font-medium text-zinc-700"
          >
            勤務地
          </label>
          <select
            id="prefecture"
            name="prefecture"
            defaultValue={prefecture}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="">指定なし</option>
            {JOB_POSTING_PREFECTURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="w-40">
          <label
            htmlFor="employment_type"
            className="text-sm font-medium text-zinc-700"
          >
            雇用形態
          </label>
          <select
            id="employment_type"
            name="employment_type"
            defaultValue={employmentType}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="">指定なし</option>
            {Object.entries(employmentTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          検索する
        </button>
      </form>

      <div className="mt-8">
        {result === null || result.data.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-zinc-500">
            該当する求人が見つかりませんでした。
          </p>
        ) : (
          <ul className="space-y-4">
            {result.data.map((jobPosting) => (
              <li key={jobPosting.id}>
                <Link
                  href={`/jobs/${jobPosting.id}`}
                  className="relative flex items-center gap-5 border border-zinc-200 p-5 pb-4 transition hover:border-sky-300 hover:shadow-sm"
                >
                  {jobPosting.job_posting_images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- 外部(Laravelのpublic disk)から配信される画像なのでnext/imageの最適化対象外
                    <img
                      src={jobPosting.job_posting_images[0].url}
                      alt=""
                      width={192}
                      height={128}
                      className="h-32 w-48 shrink-0 border border-zinc-200 bg-zinc-50 object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-48 shrink-0 items-center justify-center border border-zinc-200 bg-zinc-50 text-xs text-zinc-400">
                      No image
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-lg font-bold text-zinc-900">
                      {jobPosting.title}
                    </p>
                    <p className="mt-1 truncate text-sm text-zinc-600">
                      {jobPosting.company.name}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {employmentTypeLabels[jobPosting.employment_type]} /{" "}
                      {jobPosting.prefecture}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-800">
                      月給 {jobPosting.salary_min.toLocaleString()}円 〜{" "}
                      {jobPosting.salary_max.toLocaleString()}円
                    </p>
                  </div>

                  <span className="absolute right-5 bottom-4 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-brand">
                    ♡ {jobPosting.likes_count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {result && result.last_page > 1 && (
        <div className="mt-8 flex items-center justify-center gap-6">
          {page > 1 ? (
            <Link
              href={buildPageHref(page - 1)}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              前へ
            </Link>
          ) : (
            <span className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-300">
              前へ
            </span>
          )}

          <span className="text-sm text-zinc-600">
            {result.current_page} / {result.last_page} ページ
          </span>

          {page < result.last_page ? (
            <Link
              href={buildPageHref(page + 1)}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              次へ
            </Link>
          ) : (
            <span className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-300">
              次へ
            </span>
          )}
        </div>
      )}
    </div>
  );
}
