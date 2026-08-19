import { SeekerHeader } from "@/components/seeker/SeekerHeader";

// SCシェル。ナビゲーション(アクティブリンク表示・ログアウト)はSanctumのcookie認証を
// ブラウザ側でしか読めないため、CCのSeekerHeaderに持たせている
export default function Layout(props: LayoutProps<"/seeker">) {
  return (
    <>
      <SeekerHeader />
      {props.children}
    </>
  );
}
