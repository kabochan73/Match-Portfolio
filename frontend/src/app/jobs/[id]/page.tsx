// SC。ISR対象(revalidate ~2h + オンデマンド再検証)。いいねボタンのみ後でCCアイランドとして追加する
export default async function Page(props: PageProps<"/jobs/[id]">) {
  const { id } = await props.params;
  return <h1>求人詳細(ID: {id})</h1>;
}
