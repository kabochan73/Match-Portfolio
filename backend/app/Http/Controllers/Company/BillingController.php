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

    /**
     * 請求履歴一覧(paymentsテーブルはStripe Webhookで同期されるキャッシュ)。新しい順で返す
     */
    public function payments(Request $request): JsonResponse
    {
        return response()->json(
            $request->user('company')->payments()->latest('created_at')->get()
        );
    }

    /**
     * Stripeのホスト型カスタマーポータルへのURLを発行する。支払い方法の更新・請求履歴の確認は
     * このアプリ側でカード情報を扱わずStripe側に任せる(checkoutと同じ方針)。
     * 未払い(unpaid)状態からの復旧手段はこのポータルのみで、独自の「支払い方法更新」画面は作らない
     */
    public function portal(Request $request): JsonResponse
    {
        $company = $request->user('company');

        if (! $company->hasStripeId()) {
            throw ValidationException::withMessages([
                'billing' => ['お支払い方法の登録がまだ行われていません。'],
            ]);
        }

        $portalUrl = $company->billingPortalUrl(config('app.frontend_url').'/company/billing');

        return response()->json(['portal_url' => $portalUrl]);
    }
}
