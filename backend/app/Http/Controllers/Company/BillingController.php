<?php

namespace App\Http\Controllers\Company;

use App\Enums\BillingStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

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

    /**
     * 求人掲載プラン(月額1,000円)のサブスクリプション開始用Checkout Sessionを作成する。
     * カード情報はStripeのホスト型Checkoutページで直接入力してもらうため、このアプリ側ではカード情報を扱わない。
     * 成功/決済失敗時のリダイレクト先はフロントエンド(Next.js)側のページを指す
     */
    public function checkout(Request $request): JsonResponse
    {
        $company = $request->user('company');

        // 既に契約中、または未払い状態(既存サブスクリプションの支払い方法更新で対応すべき)の場合は
        // 新規サブスクリプションを二重に作らせない
        if ($company->billingStatus() !== BillingStatus::Uncontracted) {
            throw ValidationException::withMessages([
                'billing' => ['既に契約されています。'],
            ]);
        }

        $checkout = $company->newSubscription('default', config('services.stripe.job_posting_price_id'))
            ->checkout([
                'success_url' => config('app.frontend_url').'/company/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => config('app.frontend_url').'/company/billing?checkout=cancelled',
            ]);

        return response()->json(['checkout_url' => $checkout->url]);
    }
}
