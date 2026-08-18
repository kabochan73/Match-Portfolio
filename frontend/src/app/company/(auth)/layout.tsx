// SCシェル。login/register/forgot-password/reset-passwordのカード枠は
// ネストした(card)ルートグループ側に持たせ、explanationはここでは素通しにする
// (explanationは幅広レイアウトのため、狭いカード枠と相性が悪い)
export default function Layout(props: LayoutProps<"/company">) {
  return <>{props.children}</>;
}
