<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

// 求職者(users)向けの認証エンドポイント。企業(companies)側は別途/company配下に実装する
Route::post('/register', [RegisteredUserController::class, 'store'])
    ->middleware('guest:web');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest:web');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:web');
