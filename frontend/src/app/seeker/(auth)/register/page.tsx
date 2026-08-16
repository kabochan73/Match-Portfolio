import { RegisterForm } from "@/app/seeker/_components/RegisterForm";

// SCシェル。フォーム部分(react-hook-form + TanStack Query)のみCCアイランドとして切り出す
export default function Page() {
  return (
    <>
      <h1>求職者会員登録</h1>
      <RegisterForm />
    </>
  );
}
