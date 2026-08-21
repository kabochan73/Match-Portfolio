import { notFound } from "next/navigation";
import { AvatarView } from "@/components/company/avatar/AvatarView";
import { BasicProfileView } from "@/components/company/profile/BasicProfileView";
import { CoverImageView } from "@/components/company/cover-image/CoverImageView";
import { BackButton } from "@/components/public/BackButton";
import { getCompany } from "@/lib/companies";

// SC。ISR対象(revalidate 2h + バックエンドからの/api/revalidate経由のオンデマンド再検証)。
// 表示部分はcompany/(dashboard)/profileと同じsrc/components/company/配下を使い回す。
// 「求人詳細へ戻る」はどの求人から来たか受け取る仕組みがないため、
// staticなLinkではなくブラウザ履歴を戻るBackButton(CCアイランド)を使う
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
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="flex justify-end">
        <BackButton label="求人詳細へ戻る" />
      </div>

      <div className="mt-4 flex items-center gap-4 pb-8">
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
