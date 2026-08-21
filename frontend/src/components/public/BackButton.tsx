"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

// SC(companies/[id]など)にstatic Linkでは表現できない「ブラウザ履歴を1つ戻る」
// 挙動を埋め込むための、状態を持たない最小のCCアイランド
export function BackButton({ label }: { label: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-600 hover:text-brand"
    >
      <ChevronLeft size={18} />
      {label}
    </button>
  );
}
