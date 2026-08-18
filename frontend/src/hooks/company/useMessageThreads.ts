"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import type { LikeStatus, LikeType } from "@/hooks/company/useLikes";

// バックエンドのMessageモデルのJSON表現
export type Message = {
  id: number;
  like_id: number;
  sender_type: "user" | "company";
  sender_id: number;
  body: string;
  read_at: string | null;
  created_at: string;
};

// メッセージスレッド一覧の1件(マッチ成立済みのlikes)。
// バックエンドのCompany\MessageThreadController@indexが返す形と対応
export type MessageThread = {
  id: number;
  like_type: LikeType;
  status: LikeStatus;
  company_responded_at: string | null;
  job_posting: {
    id: number;
    title: string;
  };
  user: {
    id: number;
    name: string;
    avatar_url: string | null;
  };
  latest_message: Message | null;
  unread_messages_count: number;
};

export const messageThreadsQueryKey = ["company", "messageThreads"] as const;

function threadMessagesQueryKey(likeId: number) {
  return ["company", "messageThreads", likeId, "messages"] as const;
}

export function useMessageThreads() {
  return useQuery({
    queryKey: messageThreadsQueryKey,
    queryFn: () => apiFetch<MessageThread[]>("/api/company/message-threads"),
  });
}

export function useThreadMessages(likeId: number) {
  return useQuery({
    queryKey: threadMessagesQueryKey(likeId),
    queryFn: () =>
      apiFetch<Message[]>(`/api/company/message-threads/${likeId}/messages`),
  });
}

export const sendMessageSchema = z.object({
  body: z.string().min(1, "メッセージを入力してください"),
});

export type SendMessageValues = z.infer<typeof sendMessageSchema>;

export function useSendMessage(likeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SendMessageValues) =>
      apiFetch<Message>(`/api/company/message-threads/${likeId}/messages`, {
        method: "POST",
        body: values,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: threadMessagesQueryKey(likeId),
      });
      queryClient.invalidateQueries({ queryKey: messageThreadsQueryKey });
    },
  });
}

export function useHideThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (likeId: number) =>
      apiFetch<void>(`/api/company/message-threads/${likeId}/hide`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageThreadsQueryKey });
    },
  });
}
