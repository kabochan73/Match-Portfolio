"use client";

import { useState } from "react";
import { buttonClass } from "@/components/button/buttonClass";
import { ApiValidationError } from "@/lib/api/client";
import { useDeleteAvatar, useUpdateAvatar } from "@/hooks/seeker/useAvatar";
import { useProfile } from "@/hooks/seeker/useProfile";

// バックエンドのUpdateImageRequestと同じ制約(jpeg/png/webp、5MB以内)。
// アップロード前に弾ける明らかな不正入力はここでチェックし、それ以外は
// サーバー側のバリデーションエラーをそのまま表示する
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5120 * 1024;

export function AvatarSection() {
  const { data: profile } = useProfile();
  const updateMutation = useUpdateAvatar();
  const deleteMutation = useDeleteAvatar();
  const [clientError, setClientError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 同じファイルを続けて選び直してもchangeイベントが発火するようにリセットする
    event.target.value = "";
    if (!file) {
      return;
    }

    setClientError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setClientError("jpeg・png・webp形式の画像を選択してください。");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setClientError("5MB以下の画像を選択してください。");
      return;
    }

    updateMutation.mutate(file);
  };

  const serverErrorMessage =
    updateMutation.error instanceof ApiValidationError
      ? updateMutation.error.errors.image?.[0]
      : undefined;

  return (
    <section>
      <h2 className="mb-4 text-sm font-bold text-zinc-900">プロフィール画像</h2>

      <div className="flex items-center gap-4">
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- 外部(Laravelのpublic disk)から配信される画像なのでnext/imageの最適化対象外
          <img
            src={profile.avatar_url}
            alt="プロフィール画像"
            width={64}
            height={64}
            className="size-16 shrink-0 rounded-full border border-zinc-200 object-cover"
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs text-zinc-400">
            未設定
          </div>
        )}

        <div>
          <label
            htmlFor="avatarFile"
            className={`${buttonClass("outline", "brand")} inline-block cursor-pointer`}
          >
            画像を選択
          </label>
          <input
            id="avatarFile"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {profile?.avatar_url && (
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
              className="ml-3 text-xs font-semibold text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              削除
            </button>
          )}
        </div>
      </div>

      {clientError && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {clientError}
        </p>
      )}
      {!clientError && updateMutation.isError && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {serverErrorMessage ??
            "アップロードに失敗しました。時間をおいて再度お試しください。"}
        </p>
      )}
      {updateMutation.isPending && (
        <p className="mt-2 text-xs text-zinc-500">アップロード中...</p>
      )}
    </section>
  );
}
