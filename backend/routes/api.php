<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\CompanyAuthenticatedSessionController;
use App\Http\Controllers\Auth\CompanyNewPasswordController;
use App\Http\Controllers\Auth\CompanyPasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredCompanyController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Company\AvatarController as CompanyAvatarController;
use App\Http\Controllers\Company\BillingController;
use App\Http\Controllers\Company\CompanyImageController;
use App\Http\Controllers\Company\JobPostingController;
use App\Http\Controllers\Company\JobPostingImageController;
use App\Http\Controllers\Company\LikeController as CompanyLikeController;
use App\Http\Controllers\Company\MessageController as CompanyMessageController;
use App\Http\Controllers\Company\MessageThreadController as CompanyMessageThreadController;
use App\Http\Controllers\Company\NotificationController as CompanyNotificationController;
use App\Http\Controllers\Company\ProfileController as CompanyProfileController;
use App\Http\Controllers\Public\CompanyController as PublicCompanyController;
use App\Http\Controllers\Public\JobPostingController as PublicJobPostingController;
use App\Http\Controllers\Seeker\AvatarController;
use App\Http\Controllers\Seeker\CertificationController;
use App\Http\Controllers\Seeker\EducationController;
use App\Http\Controllers\Seeker\LikeController;
use App\Http\Controllers\Seeker\MessageController;
use App\Http\Controllers\Seeker\MessageThreadController;
use App\Http\Controllers\Seeker\NotificationController;
use App\Http\Controllers\Seeker\ProfileController;
use App\Http\Controllers\Seeker\WorkExperienceController;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Support\Facades\Route;

// 求職者(users)向けの認証エンドポイント。ログイン済みの状態で使う操作ではないためguestミドルウェアで保護する
Route::middleware('guest:web')->group(function () {
    Route::post('/register', [RegisteredUserController::class, 'store']);
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store']);
    Route::post('/reset-password', [NewPasswordController::class, 'store']);
});

// 求職者(users)向けのログイン必須エンドポイント
Route::middleware('auth:web')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    // 求職者の基本プロフィール(氏名・自己紹介コメント・ポートフォリオURL・生年月日)
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // 求職者の職歴一覧(この一覧が職務経歴書代わりになる。求人ごとに個別の応募書類は作らない)
    Route::get('/profile/work-experiences', [WorkExperienceController::class, 'index']);
    Route::post('/profile/work-experiences', [WorkExperienceController::class, 'store']);
    Route::put('/profile/work-experiences/{workExperience}', [WorkExperienceController::class, 'update']);
    Route::delete('/profile/work-experiences/{workExperience}', [WorkExperienceController::class, 'destroy']);

    // 求職者の学歴一覧
    Route::get('/profile/educations', [EducationController::class, 'index']);
    Route::post('/profile/educations', [EducationController::class, 'store']);
    Route::put('/profile/educations/{education}', [EducationController::class, 'update']);
    Route::delete('/profile/educations/{education}', [EducationController::class, 'destroy']);

    // 求職者の資格一覧
    Route::get('/profile/certifications', [CertificationController::class, 'index']);
    Route::post('/profile/certifications', [CertificationController::class, 'store']);
    Route::put('/profile/certifications/{certification}', [CertificationController::class, 'update']);
    Route::delete('/profile/certifications/{certification}', [CertificationController::class, 'destroy']);

    // 求職者のプロフィール画像。PUTではなくPOSTなのは、PHPがPUT+multipart(ファイルアップロード)を
    // ネイティブにパースできないため、素直にPOSTの「アクション」として扱う方針にしたため
    Route::post('/profile/avatar', [AvatarController::class, 'update']);
    Route::delete('/profile/avatar', [AvatarController::class, 'destroy']);

    // 求職者の応募状況一覧・求人への「いいね」(=応募)
    Route::get('/likes', [LikeController::class, 'index']);
    Route::post('/likes', [LikeController::class, 'store']);

    // 今月の残りいいね数(通常・スーパー別枠)。/likes/{like}という動的パスと衝突しないよう、
    // 静的パスは先に定義する必要はないが(求職者側に/likes/{like}という単独GETルートは存在しない)、
    // 将来追加する際の事故を避けるため慣習的にここへ置く
    Route::get('/likes/remaining', [LikeController::class, 'remaining']);

    // 応募状況一覧からの非表示。求人が非公開/募集終了になった応募のみ対象(公開中の求人への
    // 応募は削除できない)。message-threadsのhideと同じuser_hidden_at列を使い回す
    Route::patch('/likes/{like}/hide', [LikeController::class, 'hide']);

    // 求職者のメッセージスレッド(マッチ成立済みのlikes)一覧・非表示
    Route::get('/message-threads', [MessageThreadController::class, 'index']);
    Route::patch('/message-threads/{like}/hide', [MessageThreadController::class, 'hide']);

    // スレッド内のメッセージ一覧・送信
    Route::get('/message-threads/{like}/messages', [MessageController::class, 'index']);
    Route::post('/message-threads/{like}/messages', [MessageController::class, 'store']);

    // 通知一覧(マッチ成立・新着メッセージ)・既読化
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'read']);
});

// StripeからのWebhook。認証済みユーザーからのリクエストではないためauth系ミドルウェアは付けず、
// 署名検証(StripeWebhookController内でSTRIPE_WEBHOOK_SECRETが設定されていれば自動的に有効になる)で保護する
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook']);

// 未認証の求職者・訪問者向けの公開エンドポイント(求人検索・詳細、企業プロフィール閲覧)。
// 認証系ミドルウェアは一切付けない
Route::get('/job-postings', [PublicJobPostingController::class, 'index']);
Route::get('/job-postings/{jobPosting}', [PublicJobPostingController::class, 'show']);
Route::get('/companies/{company}', [PublicCompanyController::class, 'show']);

// 企業(companies)向けの認証エンドポイント。usersとは別ガード(company)で完全に分離する
Route::prefix('company')->group(function () {
    // ログイン済みの状態で使う操作ではないためguestミドルウェアで保護する
    Route::middleware('guest:company')->group(function () {
        Route::post('/register', [RegisteredCompanyController::class, 'store']);
        Route::post('/login', [CompanyAuthenticatedSessionController::class, 'store']);
        Route::post('/forgot-password', [CompanyPasswordResetLinkController::class, 'store']);
        Route::post('/reset-password', [CompanyNewPasswordController::class, 'store']);
    });

    // 企業(companies)向けのログイン必須エンドポイント
    Route::middleware('auth:company')->group(function () {
        Route::post('/logout', [CompanyAuthenticatedSessionController::class, 'destroy']);

        // 企業の基本プロフィール(会社名・会社概要・電話番号・所在地・設立年・メンバー数・WebサイトURL)
        Route::get('/profile', [CompanyProfileController::class, 'show']);
        Route::put('/profile', [CompanyProfileController::class, 'update']);

        // 企業のプロフィール画像。POSTを使う理由は求職者側と同じ(上記コメント参照)
        Route::post('/profile/avatar', [CompanyAvatarController::class, 'update']);
        Route::delete('/profile/avatar', [CompanyAvatarController::class, 'destroy']);

        // 企業プロフィールの写真ギャラリー(最大5枚。企業ホーム画面のカバー画像を兼ねる)の登録・削除。
        // POSTを使う理由は他の画像アップロードと同じ(上記コメント参照)
        Route::post('/profile/images', [CompanyImageController::class, 'store']);
        Route::delete('/profile/images/{image}', [CompanyImageController::class, 'destroy']);

        // 求人の投稿・編集・削除。公開/非公開/募集終了の切り替えは別エンドポイント(下記)で行う
        Route::get('/job-postings', [JobPostingController::class, 'index']);
        Route::post('/job-postings', [JobPostingController::class, 'store']);
        Route::get('/job-postings/{jobPosting}', [JobPostingController::class, 'show']);
        Route::put('/job-postings/{jobPosting}', [JobPostingController::class, 'update']);
        Route::delete('/job-postings/{jobPosting}', [JobPostingController::class, 'destroy']);

        // 求人の公開状態切り替え。unpublished(課金失敗による自動非公開)には企業側から直接遷移できない
        Route::patch('/job-postings/{jobPosting}/publish', [JobPostingController::class, 'publish']);
        Route::patch('/job-postings/{jobPosting}/unpublish', [JobPostingController::class, 'unpublish']);
        Route::patch('/job-postings/{jobPosting}/close', [JobPostingController::class, 'close']);

        // 求人画像(最大5枚)の登録・削除。POSTを使う理由は他の画像アップロードと同じ(上記コメント参照)
        Route::post('/job-postings/{jobPosting}/images', [JobPostingImageController::class, 'store']);
        Route::delete('/job-postings/{jobPosting}/images/{image}', [JobPostingImageController::class, 'destroy']);

        // 自社の求人への応募者一覧・プロフィール詳細閲覧
        Route::get('/job-postings/{jobPosting}/likes', [CompanyLikeController::class, 'index']);
        Route::get('/likes/{like}', [CompanyLikeController::class, 'show']);

        // 応募者への「気になる」。7日以内に反応しないと自動的にマッチ不成立になる(likes:expireバッチ)
        Route::patch('/likes/{like}/match', [CompanyLikeController::class, 'match']);

        // 応募者一覧からの非表示。message-threadsのhideと同じcompany_hidden_at列を使い回す
        Route::patch('/likes/{like}/hide', [CompanyLikeController::class, 'hide']);

        // 企業のメッセージスレッド(マッチ成立済みのlikes)一覧・非表示
        Route::get('/message-threads', [CompanyMessageThreadController::class, 'index']);
        Route::patch('/message-threads/{like}/hide', [CompanyMessageThreadController::class, 'hide']);

        // スレッド内のメッセージ一覧・送信
        Route::get('/message-threads/{like}/messages', [CompanyMessageController::class, 'index']);
        Route::post('/message-threads/{like}/messages', [CompanyMessageController::class, 'store']);

        // 通知一覧(新しい応募・新着メッセージ)・既読化
        Route::get('/notifications', [CompanyNotificationController::class, 'index']);
        Route::patch('/notifications/{notification}/read', [CompanyNotificationController::class, 'read']);

        // 課金ステータス(未契約/課金中/未払い)確認
        Route::get('/billing/status', [BillingController::class, 'status']);

        // 求人掲載プランのサブスクリプション開始(Stripe Checkoutへのリダイレクト用URLを返す)
        Route::post('/billing/checkout', [BillingController::class, 'checkout']);

        // Stripeカスタマーポータル(支払い方法の更新・請求履歴確認)へのURLを発行する。
        // 未払い状態からの復旧はこのポータル経由でカードを更新してもらう想定
        Route::post('/billing/portal', [BillingController::class, 'portal']);

        // 請求履歴(Stripe Webhookで同期されたpaymentsテーブルの一覧)
        Route::get('/billing/payments', [BillingController::class, 'payments']);
    });
});
