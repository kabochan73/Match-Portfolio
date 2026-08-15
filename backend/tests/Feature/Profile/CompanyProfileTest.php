<?php

use App\Models\Company;

it('updates the profile of the authenticated company', function () {
    $company = Company::factory()->create([
        'name' => '旧株式会社',
        'description' => '旧概要',
        'phone_number' => '03-0000-0000',
        'prefecture' => '東京都',
        'address_line' => '旧住所1-1-1',
        'founded_year' => 2000,
        'member_count_range' => '1_10',
        'website_url' => 'https://old.example.com',
    ]);

    $response = $this->actingAs($company, 'company')->putJson('/api/company/profile', [
        'name' => '新株式会社',
        'description' => '新しい会社概要です',
        'phone_number' => '03-1111-1111',
        'prefecture' => '大阪府',
        'address_line' => '新住所2-2-2',
        'founded_year' => 2010,
        'member_count_range' => '11_50',
        'website_url' => 'https://new.example.com',
    ]);

    $response->assertOk();
    expect($company->fresh())
        ->name->toBe('新株式会社')
        ->description->toBe('新しい会社概要です')
        ->phone_number->toBe('03-1111-1111')
        ->prefecture->value->toBe('大阪府')
        ->address_line->toBe('新住所2-2-2')
        ->founded_year->toBe(2010)
        ->member_count_range->value->toBe('11_50')
        ->website_url->toBe('https://new.example.com');
});

it('allows clearing optional fields', function () {
    $company = Company::factory()->create([
        'description' => '旧概要',
        'phone_number' => '03-0000-0000',
    ]);

    $response = $this->actingAs($company, 'company')->putJson('/api/company/profile', [
        'name' => $company->name,
        'description' => null,
        'phone_number' => null,
    ]);

    $response->assertOk();
    expect($company->fresh())->description->toBeNull()->phone_number->toBeNull();
});

it('rejects an invalid prefecture', function () {
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->putJson('/api/company/profile', [
        'name' => $company->name,
        'prefecture' => 'リモート',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('prefecture');
});

it('rejects an invalid member_count_range', function () {
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->putJson('/api/company/profile', [
        'name' => $company->name,
        'member_count_range' => 'invalid',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('member_count_range');
});

it('rejects a founded_year in the future', function () {
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->putJson('/api/company/profile', [
        'name' => $company->name,
        'founded_year' => now()->year + 1,
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('founded_year');
});

it('rejects unauthenticated requests', function () {
    $response = $this->putJson('/api/company/profile', ['name' => '株式会社サンプル']);

    $response->assertUnauthorized();
});
