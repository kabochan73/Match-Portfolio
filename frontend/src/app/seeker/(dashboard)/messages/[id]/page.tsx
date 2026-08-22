"use client";

// CC。Sanctumのcookie認証データをTanStack Queryで取得するため、routeのparams(Promise)は
// asyncにできずReact 19のuse()で受け取る
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { use } from "react";
import { useForm } from "react-hook-form";
import {
  type SendMessageValues,
  sendMessageSchema,
  useSendMessage,
  useThreadMessages,
} from "@/hooks/seeker/useMessageThreads";

export default function Page(props: PageProps<"/seeker/messages/[id]">) {
  const { id } = use(props.params);
  const likeId = Number(id);
  const { data: messages, isLoading, isError } = useThreadMessages(likeId);
  const sendMessageMutation = useSendMessage(likeId);
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
    return (
      <p className="px-4 py-12 text-center text-sm text-zinc-500">
        読み込み中...
      </p>
    );
  }

  if (isError || !messages) {
    return (
      <p role="alert" className="px-4 py-12 text-center text-sm text-red-600">
        メッセージの取得に失敗しました。
      </p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-12">
      <h1 className="sr-only">メッセージ詳細</h1>
      <div className="pb-8 flex justify-end">
        <Link
          href="/seeker/messages"
          className="text-sm font-semibold text-brand hover:underline"
        >
          ← メッセージ一覧に戻る
        </Link>
      </div>

      {messages.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-zinc-500">
          まだメッセージはありません。
        </p>
      ) : (
        <ul className="flex flex-1 flex-col gap-4">
          {messages.map((message) => {
            const isMine = message.sender_type === "user";

            return (
              <li
                key={message.id}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                <p
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                    isMine
                      ? "rounded-br-sm bg-brand text-white"
                      : "rounded-bl-sm bg-zinc-100 text-zinc-900"
                  }`}
                >
                  {message.body}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {message.created_at.slice(0, 16).replace("T", " ")}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <form
        onSubmit={onSubmit}
        noValidate
        className="sticky bottom-0 mt-8 border-t border-zinc-200 bg-white pt-4"
      >
        <label htmlFor="body" className="sr-only">
          メッセージ
        </label>
        <textarea
          id="body"
          rows={3}
          {...register("body")}
          className="w-full resize-none border border-zinc-300 p-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        {errors.body && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {errors.body.message}
          </p>
        )}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting || sendMessageMutation.isPending}
            className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            送信
          </button>
        </div>
      </form>
    </div>
  );
}
