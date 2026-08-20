import { notFound } from "next/navigation";
import { AvatarView } from "@/components/company/avatar/AvatarView";
import { BasicProfileView } from "@/components/company/profile/BasicProfileView";
import { CoverImageView } from "@/components/company/cover-image/CoverImageView";
import { getCompany } from "@/lib/companies";

// SC。ISR対象(revalidate 2h + オンデマンド再検証は未実装)。
// 表示部分はcompany/(dashboard)/profileと同じsrc/components/company/配下を使い回す
export async function generateStaticParams() {
  return [];
}

export default async function Page(props: PageProps<"/companies/[id]">) {
  const { id } = await props.params;
  const company = await getCompany(id);

  if (!company) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex items-center gap-4 pb-8">
        <AvatarView avatarUrl={company.avatar_url} />
        <h1 className="text-4xl font-bold text-zinc-900">{company.name}</h1>
      </div>

      <div className="pb-8">
        <CoverImageView coverImageUrl={company.cover_image_url} />
      </div>

      <div className="py-8">
        <BasicProfileView profile={company} />
      </div>
    </div>
  );
}
