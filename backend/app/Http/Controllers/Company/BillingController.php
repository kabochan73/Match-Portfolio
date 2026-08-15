<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    /**
     * 認証中の企業の課金ステータス(未契約/課金中/未払い)を返す
     */
    public function status(Request $request): JsonResponse
    {
        return response()->json([
            'status' => $request->user('company')->billingStatus(),
        ]);
    }
}
