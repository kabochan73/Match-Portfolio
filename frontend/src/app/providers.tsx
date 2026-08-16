"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // useStateで初期化し、リクエストごとに新しいQueryClientを作る(TanStack Query公式推奨のSSR対応パターン)。
  // モジュールスコープで作ると複数リクエスト間でキャッシュが共有されてしまう
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
