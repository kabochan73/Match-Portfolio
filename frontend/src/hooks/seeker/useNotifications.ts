"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";

// バックエンドの通知クラスの完全修飾クラス名(typeカラムにそのまま入る)
export const NOTIFICATION_TYPE = {
  LikeMatched: "App\\Notifications\\LikeMatched",
  NewMessage: "App\\Notifications\\NewMessage",
} as const;

export type LikeMatchedData = {
  like_id: number;
  job_posting_id: number;
  job_posting_title: string;
  company_name: string;
};

export type NewMessageData = {
  like_id: number;
  message_id: number;
  sender_type: "user" | "company";
  body: string;
};

// バックエンドのnotificationsテーブル(Laravel標準)のJSON表現
export type AppNotification = {
  id: string;
  type: string;
  data: LikeMatchedData | NewMessageData;
  read_at: string | null;
  created_at: string;
};

export const notificationsQueryKey = ["seeker", "notifications"] as const;

export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: () => apiFetch<AppNotification[]>("/api/notifications"),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      apiFetch<void>(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });
}
