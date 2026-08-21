<?php

use App\Services\NextjsRevalidationService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

it('posts the tag and shared secret to the configured Next.js revalidate endpoint', function () {
    config(['services.nextjs.internal_url' => 'http://frontend:3000', 'services.nextjs.revalidate_secret' => 'test-secret']);
    Http::fake(['frontend:3000/api/revalidate' => Http::response(['revalidated' => true], 200)]);

    (new NextjsRevalidationService)->revalidate('job-posting-1');

    Http::assertSent(function ($request) {
        return $request->url() === 'http://frontend:3000/api/revalidate'
            && $request['tag'] === 'job-posting-1'
            && $request['secret'] === 'test-secret';
    });
});

it('does not throw when the Next.js endpoint responds with an error', function () {
    Http::fake(['frontend:3000/api/revalidate' => Http::response(['message' => 'Invalid secret'], 401)]);
    config(['services.nextjs.internal_url' => 'http://frontend:3000']);

    (new NextjsRevalidationService)->revalidate('job-posting-1');

    Http::assertSentCount(1);
});

it('does not throw when the Next.js endpoint is unreachable', function () {
    Http::fake(['frontend:3000/api/revalidate' => fn () => throw new ConnectionException('Connection refused')]);
    config(['services.nextjs.internal_url' => 'http://frontend:3000']);

    // 例外が外に漏れずここまで到達すればOK(漏れていればテスト自体が失敗する)
    (new NextjsRevalidationService)->revalidate('job-posting-1');

    expect(true)->toBeTrue();
});
