"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";

// バックエンドのCompany::billingStatus()が返す3値(DB上には持たず、
// Cashierのsubscriptions.stripe_statusから都度導出される)
export type BillingStatus = "uncontracted" | "active" | "unpaid";

export const billingStatusLabels: Record<BillingStatus, string> = {
  uncontracted: "未契約",
  active: "課金中",
  unpaid: "未払い(求人非公開中)",
};

// バックエンドのpayments.statusのCHECK制約と対応する請求1件ごとの状態
export type PaymentStatus = "paid" | "failed" | "pending";

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  paid: "支払い済み",
  failed: "支払い失敗",
  pending: "処理中",
};

// バックエンドのPaymentモデルのJSON表現。amountは円単位の整数
export type Payment = {
  id: number;
  company_id: number;
  stripe_invoice_id: string;
  amount: number;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
};

export function useBillingStatus() {
  return useQuery({
    queryKey: ["company", "billing", "status"],
    queryFn: () =>
      apiFetch<{ status: BillingStatus }>("/api/company/billing/status"),
  });
}

export function useBillingPayments() {
  return useQuery({
    queryKey: ["company", "billing", "payments"],
    queryFn: () => apiFetch<Payment[]>("/api/company/billing/payments"),
  });
}

// 求人掲載プランのサブスクリプション開始用Checkout SessionのURLを取得する。
// カード情報はStripeのホスト型Checkoutページで直接入力してもらうため、
// 呼び出し側でwindow.location.hrefにcheckout_urlをセットして遷移させる想定
export function useStartCheckout() {
  return useMutation({
    mutationFn: () =>
      apiFetch<{ checkout_url: string }>("/api/company/billing/checkout", {
        method: "POST",
      }),
  });
}

// Stripeカスタマーポータル(支払い方法の更新・請求履歴確認)へのURLを取得する。
// 未払い状態からの復旧はこのポータル経由でカードを更新してもらう想定
export function useBillingPortal() {
  return useMutation({
    mutationFn: () =>
      apiFetch<{ portal_url: string }>("/api/company/billing/portal", {
        method: "POST",
      }),
  });
}
