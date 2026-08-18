<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Concerns\ManagesNotifications;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NotificationController extends Controller
{
    use ManagesNotifications;

    /**
     * 認証中の求職者宛の通知一覧(マッチ成立・新着メッセージ)
     */
    public function index(Request $request): JsonResponse
    {
        return $this->listNotifications($request, 'web');
    }

    public function read(Request $request, string $notification): Response
    {
        return $this->markNotificationRead($request, 'web', $notification);
    }
}
