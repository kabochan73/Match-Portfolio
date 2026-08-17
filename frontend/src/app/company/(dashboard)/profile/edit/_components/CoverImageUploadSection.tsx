"use client";

import { useState } from "react";
import { ApiValidationError } from "@/lib/api/client";
import {
  useDeleteCoverImage,
  useUpdateCoverImage,
} from "@/hooks/company/useCoverImage";
import { useProfile } from "@/hooks/company/useProfile";

// AvatarUploadSectionと同じ制約・同じ方針(jpeg/png/webp、5MB以内)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5120 * 1024;

export function CoverImageUploadSection() {
  const { data: profile } = useProfile();
  const updateMutation = useUpdateCoverImage();
  const deleteMutation = useDeleteCoverImage();
  const [clientError, setClientError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
      <h2>カバー画像</h2>

      {profile?.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- 外部(Laravelのpublic disk)から配信される画像なのでnext/imageの最適化対象外
        <img src={profile.cover_image_url} alt="カバー画像" width={480} />
      ) : (
        <p>未設定です</p>
      )}

      <div>
        <label htmlFor="coverImageFile">画像を選択</label>
        <input
          id="coverImageFile"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
        />
      </div>

      {clientError && <p role="alert">{clientError}</p>}
      {!clientError && updateMutation.isError && (
        <p role="alert">
          {serverErrorMessage ??
            "アップロードに失敗しました。時間をおいて再度お試しください。"}
        </p>
      )}
      {updateMutation.isPending && <p>アップロード中...</p>}

      {profile?.cover_image_url && (
        <button
          type="button"
          disabled={deleteMutation.isPending}
          onClick={() => deleteMutation.mutate()}
        >
          削除する
        </button>
      )}
    </section>
  );
}
