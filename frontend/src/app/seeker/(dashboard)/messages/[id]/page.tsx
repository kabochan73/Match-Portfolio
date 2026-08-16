// CC予定(cookie認証されたメッセージスレッドをTanStack Queryで取得)
export default async function Page(props: PageProps<"/seeker/messages/[id]">) {
  const { id } = await props.params;
  return <h1>メッセージ詳細(ID: {id})</h1>;
}
