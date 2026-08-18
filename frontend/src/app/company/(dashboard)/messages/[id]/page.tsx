"use client";

// CC。Sanctumのcookie認証データをTanStack Queryで取得するため、routeのparams(Promise)は
// asyncにできずReact 19のuse()で受け取る
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { useForm } from "react-hook-form";
import {
  type SendMessageValues,
  sendMessageSchema,
  useHideThread,
  useSendMessage,
  useThreadMessages,
} from "@/hooks/company/useMessageThreads";

export default function Page(props: PageProps<"/company/messages/[id]">) {
  const { id } = use(props.params);
  const likeId = Number(id);
  const router = useRouter();
  const { data: messages, isLoading, isError } = useThreadMessages(likeId);
  const sendMessageMutation = useSendMessage(likeId);
  const hideThreadMutation = useHideThread();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SendMessageValues>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: { body: "" },
  });

  const onSubmit = handleSubmit((values) => {
    sendMessageMutation.mutate(values, { onSuccess: () => reset() });
  });

  if (isLoading) {
    return <p>読み込み中...</p>;
  }

  if (isError || !messages) {
    return <p role="alert">メッセージの取得に失敗しました。</p>;
  }

  return (
    <>
      <h1>メッセージ詳細</h1>
      <p>
        <Link href="/company/messages">メッセージ一覧に戻る</Link>
      </p>
      <button
        type="button"
        onClick={() =>
          hideThreadMutation.mutate(likeId, {
            onSuccess: () => router.push("/company/messages"),
          })
        }
        disabled={hideThreadMutation.isPending}
      >
        このスレッドを一覧から削除
      </button>

      {messages.length === 0 ? (
        <p>まだメッセージはありません。</p>
      ) : (
        <ul>
          {messages.map((message) => (
            <li key={message.id}>
              <p>{message.sender_type === "company" ? "自分" : "求職者"}</p>
              <p>{message.body}</p>
              <p>{message.created_at.slice(0, 16).replace("T", " ")}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onSubmit} noValidate>
        <label htmlFor="body">メッセージ</label>
        <textarea id="body" {...register("body")} />
        {errors.body && <p role="alert">{errors.body.message}</p>}
        <button type="submit" disabled={isSubmitting}>
          送信
        </button>
      </form>
    </>
  );
}
