<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * users.avatar_path / companies.avatar_path / companies.cover_image_path など、
 * 「public diskに1枚だけ保存し、差し替え時は古いファイルを消す」という
 * 同じ形の画像アップロード処理をコントローラ間で共有するためのtrait
 */
trait HandlesProfileImageUploads
{
    /**
     * 画像をpublic diskに保存し、保存先の相対パスを返す
     */
    protected function storeProfileImage(UploadedFile $file, string $directory): string
    {
        return $file->store($directory, 'public');
    }

    /**
     * 差し替え・削除前の古い画像ファイルをpublic diskから消す。
     * $pathがnull(未設定)の場合は何もしない
     */
    protected function deleteProfileImage(?string $path): void
    {
        if ($path !== null) {
            Storage::disk('public')->delete($path);
        }
    }
}
