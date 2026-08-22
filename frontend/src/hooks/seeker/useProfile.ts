"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";

// バックエンドのUserモデルのJSON表現(職歴・学歴・資格は別エンドポイントで扱うためここには含めない)
export type SeekerProfile = {
  id: number;
  name: string;
  email: string;
  comment: string | null;
  portfolio_url: string | null;
  birth_date: string;
  avatar_url: string | null;
};

export function useProfile() {
  return useQuery({
    queryKey: ["seeker", "profile"],
    queryFn: () => apiFetch<SeekerProfile>("/api/profile"),
    // 未ログイン時の401は「ログインしていないだけ」の正常系であり、リトライしても結果は
    // 変わらない。Header.tsxの同じクエリキーへの問い合わせと挙動を揃える意味でも明示しておく
    retry: false,
    // 自分の操作(useUpdateProfile/useAvatar)でしか変わらないデータで、更新時は
    // setQueryDataでキャッシュを直接更新しているため、マウントの度の再取得は不要
    staleTime: 5 * 60 * 1000,
  });
}
