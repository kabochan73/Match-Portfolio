<?php

use App\Models\Company;

it('shows a company profile', function () {
    $company = Company::factory()->create(['name' => '公開株式会社']);

    $response = $this->getJson("/api/companies/{$company->id}");

    $response->assertOk()->assertJsonFragment(['name' => '公開株式会社']);
});

it('returns 404 for a nonexistent company', function () {
    $response = $this->getJson('/api/companies/999999');

    $response->assertNotFound();
});
