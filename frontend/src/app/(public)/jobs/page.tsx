import Link from "next/link";
import { buttonClass } from "@/components/button/buttonClass";
import { FormField, formInputClass } from "@/components/form/FormField";
import { JobPostingCard } from "@/components/public/JobPostingCard";
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
        className="mt-2 flex flex-wrap items-end gap-4 rounded-2xl bg-white p-4"
      >
        <div className="min-w-40 flex-1">
          <FormField htmlFor="keyword" label="キーワード">
            <input
              id="keyword"
              name="keyword"
              type="text"
              defaultValue={keyword}
              placeholder="職種・言語など"
              className={formInputClass("brand")}
            />
          </FormField>
        </div>

        <div className="w-40">
          <FormField htmlFor="prefecture" label="勤務地">
            <select
              id="prefecture"
              name="prefecture"
              defaultValue={prefecture}
              className={formInputClass("brand")}
            >
              <option value="">指定なし</option>
              {JOB_POSTING_PREFECTURES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="w-40">
          <FormField htmlFor="employment_type" label="雇用形態">
            <select
              id="employment_type"
              name="employment_type"
              defaultValue={employmentType}
              className={formInputClass("brand")}
            >
              <option value="">指定なし</option>
              {Object.entries(employmentTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <button type="submit" className={buttonClass("primary", "brand")}>
          検索する
        </button>
      </form>

      <div className="mt-4">
        {result === null || result.data.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-zinc-500">
            該当する求人が見つかりませんでした。
          </p>
        ) : (
          <ul className="space-y-4">
            {result.data.map((jobPosting) => (
              <li key={jobPosting.id}>
                <JobPostingCard jobPosting={jobPosting} />
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
              className={buttonClass("secondary")}
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
              className={buttonClass("secondary")}
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
