import { Header } from "@/components/Header";

// SCシェル。トップページ・求人検索・企業ページなど未ログインでも見られる
// 公開ページ共通のグループで、全ページ共通だったHeaderをここに持たせる
export default function Layout(props: LayoutProps<"/">) {
  return (
    <>
      <Header />
      {props.children}
    </>
  );
}
