<?php

use App\Models\JobPosting;

it('lists only published job postings', function () {
    JobPosting::factory()->create(['status' => 'published', 'published_at' => now()]);
    JobPosting::factory()->create(['status' => 'draft']);
    JobPosting::factory()->create(['status' => 'closed']);
    JobPosting::factory()->create(['status' => 'unpublished']);

    $response = $this->getJson('/api/job-postings');

    $response->assertOk()->assertJsonCount(1);
});

it('filters by keyword matching title or description', function () {
    JobPosting::factory()->create([
        'status' => 'published', 'published_at' => now(),
        'title' => 'バックエンドエンジニア', 'description' => 'Laravelを使った開発',
    ]);
    JobPosting::factory()->create([
        'status' => 'published', 'published_at' => now(),
        'title' => 'フロントエンドエンジニア', 'description' => 'Reactを使った開発',
    ]);

    $response = $this->getJson('/api/job-postings?keyword=Laravel');

    $response->assertOk()->assertJsonCount(1)->assertJsonFragment(['title' => 'バックエンドエンジニア']);
});

it('filters by prefecture and employment_type', function () {
    JobPosting::factory()->create([
        'status' => 'published', 'published_at' => now(),
        'prefecture' => 'リモート', 'employment_type' => 'contract',
    ]);
    JobPosting::factory()->create([
        'status' => 'published', 'published_at' => now(),
        'prefecture' => '東京都', 'employment_type' => 'full_time',
    ]);

    $response = $this->getJson('/api/job-postings?prefecture=リモート&employment_type=contract');

    $response->assertOk()->assertJsonCount(1)->assertJsonFragment(['prefecture' => 'リモート']);
});

it('includes likes_count and company summary in the listing', function () {
    $jobPosting = JobPosting::factory()->create(['status' => 'published', 'published_at' => now()]);

    $response = $this->getJson('/api/job-postings');

    $response->assertOk()->assertJsonPath('0.likes_count', 0)
        ->assertJsonPath('0.company.id', $jobPosting->company_id);
});

it('shows a published job posting', function () {
    $jobPosting = JobPosting::factory()->create(['status' => 'published', 'published_at' => now()]);

    $response = $this->getJson("/api/job-postings/{$jobPosting->id}");

    $response->assertOk()->assertJsonPath('id', $jobPosting->id)
        ->assertJsonPath('company.id', $jobPosting->company_id);
});

it('returns 404 for a job posting that is not published', function () {
    $jobPosting = JobPosting::factory()->create(['status' => 'draft']);

    $response = $this->getJson("/api/job-postings/{$jobPosting->id}");

    $response->assertNotFound();
});

it('returns 404 for a nonexistent job posting', function () {
    $response = $this->getJson('/api/job-postings/999999');

    $response->assertNotFound();
});
