<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\CompanyAuthenticatedSessionController;
use App\Http\Controllers\Auth\CompanyNewPasswordController;
use App\Http\Controllers\Auth\CompanyPasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredCompanyController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\AvatarController;
use App\Http\Controllers\Company\AvatarController as CompanyAvatarController;
use App\Http\Controllers\Company\CoverImageController as CompanyCoverImageController;
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

// 求職者のプロフィール画像。PUTではなくPOSTなのは、PHPがPUT+multipart(ファイルアップロード)を
// ネイティブにパースできないため、素直にPOSTの「アクション」として扱う方針にしたため
Route::post('/profile/avatar', [AvatarController::class, 'update'])
    ->middleware('auth:web');

Route::delete('/profile/avatar', [AvatarController::class, 'destroy'])
    ->middleware('auth:web');

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
});
