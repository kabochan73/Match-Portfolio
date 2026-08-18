<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Concerns\ManagesNotifications;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NotificationController extends Controller
{
    use ManagesNotifications;

    /**
     * 認証中の企業宛の通知一覧(新しい応募・新着メッセージ)
     */
    public function index(Request $request): JsonResponse
    {
        return $this->listNotifications($request, 'company');
    }

    public function read(Request $request, string $notification): Response
    {
        return $this->markNotificationRead($request, 'company', $notification);
    }
}
