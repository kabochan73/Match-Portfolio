<?php

namespace App\Services;

use App\Models\Company;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * 求人・企業プロフィールの公開ページ(Next.js側でnext: {revalidate: 7200}のISR)は
 * 最大2時間、更新が反映されない。企業側の変更を即座に反映させるためのオンデマンド再検証
 * (Next.jsの/api/revalidate Route Handlerを叩き、該当タグをrevalidateTagしてもらう)。
 * 失敗はログに残すのみで例外は投げない: Next.js側が落ちていても2時間後には
 * 自然に追いつくため、このアプリのレスポンスを遅延・失敗させてまで担保する必要はない
 */
class NextjsRevalidationService
{
    public function revalidate(string $tag): void
    {
        try {
            $response = Http::timeout(3)->post(
                config('services.nextjs.internal_url').'/api/revalidate',
                [
                    'secret' => config('services.nextjs.revalidate_secret'),
                    'tag' => $tag,
                ]
            );

            if ($response->failed()) {
                Log::warning('Next.jsのオンデマンド再検証に失敗しました', [
                    'tag' => $tag,
                    'status' => $response->status(),
                ]);
            }
        } catch (Throwable $e) {
            Log::warning('Next.jsのオンデマンド再検証に失敗しました', [
                'tag' => $tag,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * 企業プロフィール(基本情報・ロゴ)の変更を反映する。company-{id}タグ(公開企業プロフィール)
     * に加え、その企業が持つ全求人のjob-posting-{id}タグもrevalidateする。/jobs/[id]は
     * company列を丸ごと埋め込んで表示しているため、プロフィール側だけを再検証すると
     * 求人詳細ページの会社名・ロゴ等が古いまま最大2時間残ってしまうことへの対応
     */
    public function revalidateCompanyProfile(Company $company): void
    {
        $this->revalidate("company-{$company->id}");

        foreach ($company->jobPostings()->pluck('id') as $jobPostingId) {
            $this->revalidate("job-posting-{$jobPostingId}");
        }
    }
}
