import { Header } from "@/components/Header";

// SCシェル。login/register/forgot-password/reset-passwordのカード枠は
// ネストした(card)ルートグループ側に持たせ、explanationはここでは素通しにする
// (explanationは幅広レイアウトのため、狭いカード枠と相性が悪い)。
// 未ログイン状態で使うページのため、全ページ共通のHeaderをここで持たせる
export default function Layout(props: LayoutProps<"/company">) {
  return (
    <>
      <Header />
      {props.children}
    </>
  );
}
