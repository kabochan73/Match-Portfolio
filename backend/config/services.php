<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        // 求人掲載プラン(月額1,000円、企業単位のサブスクリプション)のPrice ID
        'job_posting_price_id' => env('STRIPE_JOB_POSTING_PRICE_ID'),
    ],

    'nextjs' => [
        // /api/revalidate(ISRのオンデマンド再検証)へのURL。コンテナ間通信のためFRONTEND_URL
        // (ブラウザ向け、localhost指定)とは別に持つ
        'internal_url' => env('NEXTJS_INTERNAL_URL', 'http://localhost:3000'),
        'revalidate_secret' => env('REVALIDATE_SECRET'),
    ],

];
