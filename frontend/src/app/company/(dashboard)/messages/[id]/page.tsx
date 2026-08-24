"use client";

// CC。Sanctumのcookie認証データをTanStack Queryで取得するため、routeのparams(Promise)は
// asyncにできずReact 19のuse()で受け取る
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useForm } from "react-hook-form";
import { buttonClass } from "@/components/button/buttonClass";
import { PageError, PageLoading } from "@/components/status/PageStatus";
import { textLinkClass } from "@/lib/textLinkClass";
import {
  type SendMessageValues,
  sendMessageSchema,
  useSendMessage,
  useThreadMessages,
} from "@/hooks/company/useMessageThreads";

export default function Page(props: PageProps<"/company/messages/[id]">) {
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
    return <PageLoading />;
  }

  if (isError || !messages) {
    return <PageError message="メッセージの取得に失敗しました。" />;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-12">
      <h1 className="sr-only">メッセージ詳細</h1>
      <div className="flex justify-end pb-8">
        <Link
          href="/company/messages"
          className={textLinkClass("emerald")}
        >
          <ChevronLeft size={18} />
          メッセージ一覧に戻る
        </Link>
      </div>

      {messages.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-zinc-500">
          まだメッセージはありません。
        </p>
      ) : (
        <ul className="flex flex-1 flex-col gap-4">
          {messages.map((message) => {
            const isMine = message.sender_type === "company";

            return (
              <li
                key={message.id}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                <p
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                    isMine
                      ? "rounded-br-sm bg-emerald-600 text-white"
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
        className="sticky bottom-0 mt-8 border-t border-zinc-400 bg-white pt-4"
      >
        <label htmlFor="body" className="sr-only">
          メッセージ
        </label>
        <textarea
          id="body"
          rows={3}
          {...register("body")}
          className="w-full resize-none border border-zinc-400 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
            className={buttonClass("primary", "emerald")}
          >
            送信
          </button>
        </div>
      </form>
    </div>
  );
}
