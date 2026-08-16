// SCシェル。Sanctumのcookie認証はServer Componentから読めないため、
// ナビゲーション(usePathnameでのアクティブリンク表示・ログアウト)は後でCCの子コンポーネントとして追加する
export default function Layout(props: LayoutProps<"/company">) {
  return <>{props.children}</>;
}
