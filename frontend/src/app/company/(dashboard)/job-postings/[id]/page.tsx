// CC予定(cookie認証+フォーム送信)
export default async function Page(props: PageProps<"/company/job-postings/[id]">) {
  const { id } = await props.params;
  return <h1>求人編集(ID: {id})</h1>;
}
