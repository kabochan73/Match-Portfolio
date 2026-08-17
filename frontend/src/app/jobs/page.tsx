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

  const jobPostings = await searchJobPostings({
    keyword,
    prefecture,
    employment_type: employmentType,
  });

  return (
    <>
      <h1>求人検索・一覧</h1>

      <form method="get">
        <div>
          <label htmlFor="keyword">キーワード</label>
          <input
            id="keyword"
            name="keyword"
            type="text"
            defaultValue={keyword}
          />
        </div>

        <div>
          <label htmlFor="prefecture">勤務地</label>
          <select id="prefecture" name="prefecture" defaultValue={prefecture}>
            <option value="">指定なし</option>
            {JOB_POSTING_PREFECTURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="employment_type">雇用形態</label>
          <select
            id="employment_type"
            name="employment_type"
            defaultValue={employmentType}
          >
            <option value="">指定なし</option>
            {Object.entries(employmentTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">検索する</button>
      </form>

      {jobPostings === null || jobPostings.length === 0 ? (
        <p>該当する求人が見つかりませんでした。</p>
      ) : (
        <ul>
          {jobPostings.map((jobPosting) => (
            <li key={jobPosting.id}>
              <p>
                <Link href={`/jobs/${jobPosting.id}`}>{jobPosting.title}</Link>
              </p>
              <p>{jobPosting.company.name}</p>
              <p>
                {employmentTypeLabels[jobPosting.employment_type]} /{" "}
                {jobPosting.prefecture}
              </p>
              <p>
                月給 {jobPosting.salary_min.toLocaleString()}円 〜{" "}
                {jobPosting.salary_max.toLocaleString()}円
              </p>
              <p>応募数(いいね数): {jobPosting.likes_count}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
