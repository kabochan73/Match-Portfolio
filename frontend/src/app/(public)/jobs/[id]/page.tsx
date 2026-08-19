import Link from "next/link";
import { notFound } from "next/navigation";
import { AvatarView } from "@/components/company-profile/AvatarView";
import { employmentTypeLabels, getJobPosting } from "@/lib/jobPostings";
import { ApplySection } from "./_components/ApplySection";

// SC。ISR対象(revalidate 2h + オンデマンド再検証は未実装)。いいねボタンのみCCアイランド(ApplySection)として埋め込む
export async function generateStaticParams() {
  return [];
}

export default async function Page(props: PageProps<"/jobs/[id]">) {
  const { id } = await props.params;
  const jobPosting = await getJobPosting(id);

  if (!jobPosting) {
    notFound();
  }

  return (
    <>
      <h1>{jobPosting.title}</h1>

      <p>
        {employmentTypeLabels[jobPosting.employment_type]} /{" "}
        {jobPosting.prefecture}
      </p>
      <p>
        月給 {jobPosting.salary_min.toLocaleString()}円 〜{" "}
        {jobPosting.salary_max.toLocaleString()}円
      </p>
      <p>応募数(いいね数): {jobPosting.likes_count}</p>

      <h2>職務内容</h2>
      <p>{jobPosting.description}</p>

      <h2>求める人材像</h2>
      <p>{jobPosting.desired_candidate}</p>

      <h2>企業情報</h2>
      <AvatarView avatarUrl={jobPosting.company.avatar_url} />
      <p>
        <Link href={`/companies/${jobPosting.company.id}`}>
          {jobPosting.company.name}
        </Link>
      </p>
      {jobPosting.company.prefecture && <p>{jobPosting.company.prefecture}</p>}

      <h2>応募する</h2>
      <ApplySection jobPostingId={jobPosting.id} />
    </>
  );
}
