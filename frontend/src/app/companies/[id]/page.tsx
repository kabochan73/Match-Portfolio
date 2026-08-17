import { notFound } from "next/navigation";
import { AvatarView } from "@/components/company-profile/AvatarView";
import { BasicProfileView } from "@/components/company-profile/BasicProfileView";
import { CoverImageView } from "@/components/company-profile/CoverImageView";
import { getCompany } from "@/lib/companies";

// SC。ISR対象(revalidate 2h + オンデマンド再検証は未実装)。
// 表示部分はcompany/(dashboard)/profileと同じsrc/components/company-profile/を使い回す
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
    <>
      <h1>{company.name}</h1>

      <CoverImageView coverImageUrl={company.cover_image_url} />
      <AvatarView avatarUrl={company.avatar_url} />
      <BasicProfileView profile={company} />
    </>
  );
}
