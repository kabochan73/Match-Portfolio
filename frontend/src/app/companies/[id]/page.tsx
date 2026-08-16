// SC。ISR対象(revalidate ~2h + オンデマンド再検証)。src/components/company-profile/ProfileViewを後で読み込む
export default async function Page(props: PageProps<"/companies/[id]">) {
  const { id } = await props.params;
  return <h1>企業プロフィール(ID: {id})</h1>;
}
