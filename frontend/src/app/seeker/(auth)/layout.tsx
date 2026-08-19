import { Header } from "@/components/Header";

// SCシェル。login/register/forgot-password/reset-password共通の中央寄せカード枠。
// 未ログイン状態で使うページのため、全ページ共通のHeaderをここで持たせる
export default function Layout(props: LayoutProps<"/seeker">) {
  return (
    <>
      <Header />
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg">
          {props.children}
        </div>
      </div>
    </>
  );
}
