import { Header } from "@/components/Header";

// SCシェル。Sanctumのcookie認証はServer Componentから読めないため、
// ナビゲーション(usePathnameでのアクティブリンク表示・ログアウト)は後でCCの子コンポーネントとして追加する。
// それまでの暫定として、全ページ共通のHeaderをここで持たせる
// (seeker側は専用のSeekerHeaderに切り替え済み。company側も専用ヘッダーができ次第差し替える)
export default function Layout(props: LayoutProps<"/company">) {
  return (
    <>
      <Header />
      {props.children}
    </>
  );
}
