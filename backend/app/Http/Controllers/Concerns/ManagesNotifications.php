<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * 通知一覧の取得・既読化。求職者・企業で共通のロジックをまとめたtrait
 * (NotifiableトレイトのnotificationsリレーションはLaravel標準でcreated_atの降順)
 */
trait ManagesNotifications
{
    protected function listNotifications(Request $request, string $guard): JsonResponse
    {
        return response()->json($request->user($guard)->notifications);
    }

    /**
     * 自分宛の通知のみ既読にできるよう、notifications()経由でスコープする
     * (存在しないIDと同様404を返すため、他者の通知の存在有無も推測されない)
     */
    protected function markNotificationRead(Request $request, string $guard, string $notification): Response
    {
        $model = $request->user($guard)->notifications()->findOrFail($notification);
        $model->markAsRead();

        return response()->noContent();
    }
}
