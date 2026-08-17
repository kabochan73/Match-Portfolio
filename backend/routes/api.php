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
use App\Http\Controllers\Company\CoverImageController as CompanyCoverImageController;
use App\Http\Controllers\Company\JobPostingController;
use App\Http\Controllers\Company\ProfileController as CompanyProfileController;
use App\Http\Controllers\Public\CompanyController as PublicCompanyController;
use App\Http\Controllers\Public\JobPostingController as PublicJobPostingController;
use App\Http\Controllers\Seeker\AvatarController;
use App\Http\Controllers\Seeker\CertificationController;
use App\Http\Controllers\Seeker\EducationController;
use App\Http\Controllers\Seeker\ProfileController;
use App\Http\Controllers\Seeker\WorkExperienceController;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Support\Facades\Route;

// 求職者(users)向けの認証エンドポイント
Route::post('/register', [RegisteredUserController::class, 'store'])
    ->middleware('guest:web');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest:web');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:web');

// 求職者のパスワードリセット。ログイン済みの状態で使う操作ではないためguestミドルウェアで保護する
Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
    ->middleware('guest:web');

Route::post('/reset-password', [NewPasswordController::class, 'store'])
    ->middleware('guest:web');

// 求職者の基本プロフィール(氏名・自己紹介コメント・ポートフォリオURL・生年月日)
Route::get('/profile', [ProfileController::class, 'show'])
    ->middleware('auth:web');

Route::put('/profile', [ProfileController::class, 'update'])
    ->middleware('auth:web');

// 求職者の職歴一覧(この一覧が職務経歴書代わりになる。求人ごとに個別の応募書類は作らない)
Route::get('/profile/work-experiences', [WorkExperienceController::class, 'index'])
    ->middleware('auth:web');

Route::post('/profile/work-experiences', [WorkExperienceController::class, 'store'])
    ->middleware('auth:web');

Route::put('/profile/work-experiences/{workExperience}', [WorkExperienceController::class, 'update'])
    ->middleware('auth:web');

Route::delete('/profile/work-experiences/{workExperience}', [WorkExperienceController::class, 'destroy'])
    ->middleware('auth:web');

// 求職者の学歴一覧
Route::get('/profile/educations', [EducationController::class, 'index'])
    ->middleware('auth:web');

Route::post('/profile/educations', [EducationController::class, 'store'])
    ->middleware('auth:web');

Route::put('/profile/educations/{education}', [EducationController::class, 'update'])
    ->middleware('auth:web');

Route::delete('/profile/educations/{education}', [EducationController::class, 'destroy'])
    ->middleware('auth:web');

// 求職者の資格一覧
Route::get('/profile/certifications', [CertificationController::class, 'index'])
    ->middleware('auth:web');

Route::post('/profile/certifications', [CertificationController::class, 'store'])
    ->middleware('auth:web');

Route::put('/profile/certifications/{certification}', [CertificationController::class, 'update'])
    ->middleware('auth:web');

Route::delete('/profile/certifications/{certification}', [CertificationController::class, 'destroy'])
    ->middleware('auth:web');

// 求職者のプロフィール画像。PUTではなくPOSTなのは、PHPがPUT+multipart(ファイルアップロード)を
// ネイティブにパースできないため、素直にPOSTの「アクション」として扱う方針にしたため
Route::post('/profile/avatar', [AvatarController::class, 'update'])
    ->middleware('auth:web');

Route::delete('/profile/avatar', [AvatarController::class, 'destroy'])
    ->middleware('auth:web');

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
    Route::post('/register', [RegisteredCompanyController::class, 'store'])
        ->middleware('guest:company');

    Route::post('/login', [CompanyAuthenticatedSessionController::class, 'store'])
        ->middleware('guest:company');

    Route::post('/logout', [CompanyAuthenticatedSessionController::class, 'destroy'])
        ->middleware('auth:company');

    // 企業のパスワードリセット。ログイン済みの状態で使う操作ではないためguestミドルウェアで保護する
    Route::post('/forgot-password', [CompanyPasswordResetLinkController::class, 'store'])
        ->middleware('guest:company');

    Route::post('/reset-password', [CompanyNewPasswordController::class, 'store'])
        ->middleware('guest:company');

    // 企業の基本プロフィール(会社名・会社概要・電話番号・所在地・設立年・メンバー数・WebサイトURL)
    Route::get('/profile', [CompanyProfileController::class, 'show'])
        ->middleware('auth:company');

    Route::put('/profile', [CompanyProfileController::class, 'update'])
        ->middleware('auth:company');

    // 企業のプロフィール画像。POSTを使う理由は求職者側と同じ(上記コメント参照)
    Route::post('/profile/avatar', [CompanyAvatarController::class, 'update'])
        ->middleware('auth:company');

    Route::delete('/profile/avatar', [CompanyAvatarController::class, 'destroy'])
        ->middleware('auth:company');

    // 企業ホーム画面のカバー画像
    Route::post('/profile/cover-image', [CompanyCoverImageController::class, 'update'])
        ->middleware('auth:company');

    Route::delete('/profile/cover-image', [CompanyCoverImageController::class, 'destroy'])
        ->middleware('auth:company');

    // 求人の投稿・編集・削除。公開/非公開/募集終了の切り替えは別エンドポイント(下記)で行う
    Route::get('/job-postings', [JobPostingController::class, 'index'])
        ->middleware('auth:company');

    Route::post('/job-postings', [JobPostingController::class, 'store'])
        ->middleware('auth:company');

    Route::get('/job-postings/{jobPosting}', [JobPostingController::class, 'show'])
        ->middleware('auth:company');

    Route::put('/job-postings/{jobPosting}', [JobPostingController::class, 'update'])
        ->middleware('auth:company');

    Route::delete('/job-postings/{jobPosting}', [JobPostingController::class, 'destroy'])
        ->middleware('auth:company');

    // 求人の公開状態切り替え。unpublished(課金失敗による自動非公開)には企業側から直接遷移できない
    Route::patch('/job-postings/{jobPosting}/publish', [JobPostingController::class, 'publish'])
        ->middleware('auth:company');

    Route::patch('/job-postings/{jobPosting}/unpublish', [JobPostingController::class, 'unpublish'])
        ->middleware('auth:company');

    Route::patch('/job-postings/{jobPosting}/close', [JobPostingController::class, 'close'])
        ->middleware('auth:company');

    // 課金ステータス(未契約/課金中/未払い)確認
    Route::get('/billing/status', [BillingController::class, 'status'])
        ->middleware('auth:company');

    // 求人掲載プランのサブスクリプション開始(Stripe Checkoutへのリダイレクト用URLを返す)
    Route::post('/billing/checkout', [BillingController::class, 'checkout'])
        ->middleware('auth:company');

    // 請求履歴(Stripe Webhookで同期されたpaymentsテーブルの一覧)
    Route::get('/billing/payments', [BillingController::class, 'payments'])
        ->middleware('auth:company');
});
