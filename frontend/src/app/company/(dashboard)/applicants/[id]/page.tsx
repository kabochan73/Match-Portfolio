// CC予定。src/components/seeker-profile/の閲覧用コンポーネントを後で読み込む
export default async function Page(props: PageProps<"/company/applicants/[id]">) {
  const { id } = await props.params;
  return <h1>応募者詳細(ID: {id})</h1>;
}
