<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * SanctumのEnsureFrontendRequestsAreStatefulミドルウェアは、リクエストがconfig/sanctum.phpの
     * statefulドメインから来ていると判断できた場合のみセッション関連ミドルウェアを有効にする。
     * テストではブラウザが送るRefererヘッダーが存在しないため、ここでデフォルトとして付与しておく
     *
     * @var array<string, string>
     */
    protected $defaultHeaders = [
        'Referer' => 'http://localhost',
    ];
}
