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
  });
}
