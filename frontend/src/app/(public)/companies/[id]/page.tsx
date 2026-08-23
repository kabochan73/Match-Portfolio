import { sectionDividerClass, sectionHeadingClass } from "@/lib/sectionStyles";
import { notFound } from "next/navigation";
import { AvatarView } from "@/components/company/avatar/AvatarView";
import { BasicProfileView } from "@/components/company/profile/BasicProfileView";
import { BackButton } from "@/components/public/BackButton";
import { ImageGallery } from "@/components/public/ImageGallery";
import { JobPostingCard } from "@/components/public/JobPostingCard";
import { getCompany } from "@/lib/companies";
import { getCompanyJobPostings } from "@/lib/jobPostings";

// SC。ISR対象(revalidate 2h + バックエンドからの/api/revalidate経由のオンデマンド再検証)。
// 表示部分はcompany/(dashboard)/profileと同じsrc/components/company/配下を使い回す。
// 「求人詳細へ戻る」はどの求人から来たか受け取る仕組みがないため、
// staticなLinkではなくブラウザ履歴を戻るBackButton(CCアイランド)を使う
export async function generateStaticParams() {
  return [];
}

export default async function Page(props: PageProps<"/companies/[id]">) {
  const { id } = await props.params;
  const [company, jobPostingsResult] = await Promise.all([
    getCompany(id),
    getCompanyJobPostings(id),
  ]);

  if (!company) {
    notFound();
  }

  const jobPostings = jobPostingsResult?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex justify-end">
        <BackButton label="求人詳細へ戻る" />
      </div>

      <div className="mt-4 flex items-center gap-4 pb-8">
        <AvatarView avatarUrl={company.avatar_url} />
        <h1 className="text-4xl font-bold text-zinc-900">{company.name}</h1>
      </div>

      <ImageGallery images={company.images} />

      <div className="py-8">
        <BasicProfileView profile={company} />
      </div>

      {jobPostings.length > 0 && (
        <div className={sectionDividerClass("subtle")}>
          <h2 className={`${sectionHeadingClass} mb-4`}>掲載中の求人</h2>
          <ul className="space-y-4">
            {jobPostings.map((jobPosting) => (
              <li key={jobPosting.id}>
                <JobPostingCard jobPosting={jobPosting} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
