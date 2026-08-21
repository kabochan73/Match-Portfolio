"use client";

// CC。Sanctumのcookie認証データをTanStack Queryで取得する単発の表示ページなので、
// notifications/messages等と同じ方針でpage.tsx自体をCCにする。
// Stripe Checkoutからのリダイレクト先でもあるため、?checkout=success|cancelledを
// useSearchParams()で読む必要があり、Suspense境界で本体を包んでいる
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  type BillingStatus,
  type PaymentStatus,
  billingStatusLabels,
  paymentStatusLabels,
  useBillingPayments,
  useBillingPortal,
  useBillingStatus,
  useStartCheckout,
} from "@/hooks/company/useBilling";

// unpaidはStripeの支払い失敗による求人自動非公開状態なので、job-postingsの
// unpublishedバッジと同じ方針でamberにして目立たせる
const billingStatusBadgeClasses: Record<BillingStatus, string> = {
  uncontracted: "bg-zinc-100 text-zinc-600",
  active: "bg-emerald-100 text-emerald-700",
  unpaid: "bg-amber-100 text-amber-700",
};

const paymentStatusBadgeClasses: Record<PaymentStatus, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-zinc-100 text-zinc-600",
};

export default function Page() {
  return (
    <Suspense>
      <BillingPage />
    </Suspense>
  );
}

function BillingPage() {
  const searchParams = useSearchParams();
  const checkoutResult = searchParams.get("checkout");

  const {
    data: billingStatus,
    isLoading: isStatusLoading,
    isError: isStatusError,
  } = useBillingStatus();
  const {
    data: payments,
    isLoading: isPaymentsLoading,
    isError: isPaymentsError,
  } = useBillingPayments();
  const checkoutMutation = useStartCheckout();
  const portalMutation = useBillingPortal();

  const onStartCheckout = () => {
    checkoutMutation.mutate(undefined, {
      onSuccess: ({ checkout_url }) => {
        window.location.href = checkout_url;
      },
    });
  };

  const onOpenPortal = () => {
    portalMutation.mutate(undefined, {
      onSuccess: ({ portal_url }) => {
        window.location.href = portal_url;
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="pb-8 text-2xl font-bold text-zinc-900">
        課金ステータス確認・請求履歴
      </h1>

      {checkoutResult === "success" && (
        <p className="mb-6 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          お支払い方法の登録手続きが完了しました。反映まで少し時間がかかる場合があります。
        </p>
      )}

      {checkoutResult === "cancelled" && (
        <p className="mb-6 border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
          お支払い方法の登録がキャンセルされました。
        </p>
      )}

      <section className="border border-zinc-200 p-6">
        <h2 className="text-lg font-bold text-zinc-900">課金ステータス</h2>

        {isStatusLoading && (
          <p className="mt-4 text-sm text-zinc-500">読み込み中...</p>
        )}

        {isStatusError && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            課金ステータスの取得に失敗しました。
          </p>
        )}

        {billingStatus && (
          <>
            <div className="mt-4 flex items-center justify-between gap-4">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${billingStatusBadgeClasses[billingStatus.status]}`}
              >
                {billingStatusLabels[billingStatus.status]}
              </span>

              {billingStatus.status === "uncontracted" && (
                <button
                  type="button"
                  onClick={onStartCheckout}
                  disabled={checkoutMutation.isPending}
                  className="shrink-0 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  お支払い方法を登録する(月額1,000円)
                </button>
              )}

              {billingStatus.status === "unpaid" && (
                <button
                  type="button"
                  onClick={onOpenPortal}
                  disabled={portalMutation.isPending}
                  className="shrink-0 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  お支払い方法を更新する
                </button>
              )}
            </div>

            {billingStatus.status === "unpaid" && (
              <p className="mt-3 text-sm text-red-600">
                お支払いに失敗したため、公開中だった求人がすべて非公開になっています。上の「お支払い方法を更新する」からカード情報を更新すると、求人管理から再公開できます。
              </p>
            )}

            {checkoutMutation.isError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                お支払い手続きの開始に失敗しました。
              </p>
            )}

            {portalMutation.isError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                お支払い方法の更新ページを開けませんでした。
              </p>
            )}
          </>
        )}
      </section>

      <section className="mt-8 border border-zinc-200 p-6">
        <h2 className="text-lg font-bold text-zinc-900">請求履歴</h2>

        {isPaymentsLoading && (
          <p className="mt-4 text-sm text-zinc-500">読み込み中...</p>
        )}

        {isPaymentsError && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            請求履歴の取得に失敗しました。
          </p>
        )}

        {payments && payments.length === 0 && (
          <p className="mt-4 text-sm text-zinc-500">
            請求履歴はまだありません。
          </p>
        )}

        {payments && payments.length > 0 && (
          <ul className="mt-4 divide-y divide-zinc-100">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    ¥{payment.amount.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {payment.created_at.slice(0, 16).replace("T", " ")}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusBadgeClasses[payment.status]}`}
                >
                  {paymentStatusLabels[payment.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
