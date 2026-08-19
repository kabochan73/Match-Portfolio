import { CompanyHeader } from "@/components/company/CompanyHeader";

// SCシェル。ナビゲーション(アクティブリンク表示・ログアウト)はSanctumのcookie認証を
// ブラウザ側でしか読めないため、CCのCompanyHeaderに持たせている(seekerのSeekerHeaderと同じ方針)
export default function Layout(props: LayoutProps<"/company">) {
  return (
    <>
      <CompanyHeader />
      {props.children}
    </>
  );
}
