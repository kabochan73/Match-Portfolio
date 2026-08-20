<?php

use App\Models\Company;
use App\Models\JobPosting;
use App\Models\JobPostingImage;
use App\Models\Like;

function validJobPostingPayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'Webエンジニア',
        'description' => '自社サービスの開発をお任せします。',
        'desired_candidate' => 'Webアプリケーション開発の実務経験2年以上',
        'employment_type' => 'full_time',
        'prefecture' => '東京都',
        'salary_min' => 300000,
        'salary_max' => 500000,
    ], $overrides);
}

it('lists only the authenticated company\'s own job postings with a like count', function () {
    $company = Company::factory()->create();
    $other = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create(['title' => '自社の求人']);
    JobPosting::factory()->for($other)->create(['title' => '他社の求人']);
    Like::factory()->for($jobPosting)->create();

    $response = $this->actingAs($company, 'company')->getJson('/api/company/job-postings');

    $response->assertOk();
    expect($response->json())->toHaveCount(1)
        ->and($response->json('0.title'))->toBe('自社の求人')
        ->and($response->json('0.likes_count'))->toBe(1);
});

it('includes job posting images in the listing', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    JobPostingImage::factory()->for($jobPosting)->create();

    $response = $this->actingAs($company, 'company')->getJson('/api/company/job-postings');

    $response->assertOk()->assertJsonCount(1, '0.job_posting_images');
});

it('creates a job posting as draft for the authenticated company', function () {
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson('/api/company/job-postings', validJobPostingPayload());

    $response->assertCreated();
    expect($response->json('status'))->toBe('draft')
        ->and($response->json('published_at'))->toBeNull()
        ->and($company->jobPostings()->count())->toBe(1);
});

it('ignores a client-provided status when creating', function () {
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson(
        '/api/company/job-postings',
        validJobPostingPayload(['status' => 'published'])
    );

    $response->assertCreated();
    expect($response->json('status'))->toBe('draft');
});

it('rejects a salary_max lower than salary_min', function () {
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson(
        '/api/company/job-postings',
        validJobPostingPayload(['salary_min' => 500000, 'salary_max' => 300000])
    );

    $response->assertUnprocessable()->assertJsonValidationErrors('salary_max');
});

it('rejects an invalid employment_type', function () {
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson(
        '/api/company/job-postings',
        validJobPostingPayload(['employment_type' => 'invalid'])
    );

    $response->assertUnprocessable()->assertJsonValidationErrors('employment_type');
});

it('accepts リモート as a prefecture even though it is not a company prefecture', function () {
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson(
        '/api/company/job-postings',
        validJobPostingPayload(['prefecture' => 'リモート'])
    );

    $response->assertCreated();
});

it('shows a single job posting with a like count', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    Like::factory()->count(2)->for($jobPosting)->create();

    $response = $this->actingAs($company, 'company')->getJson("/api/company/job-postings/{$jobPosting->id}");

    $response->assertOk();
    expect($response->json('likes_count'))->toBe(2);
});

it('prevents viewing another company\'s job posting', function () {
    $company = Company::factory()->create();
    $other = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($other)->create();

    $response = $this->actingAs($company, 'company')->getJson("/api/company/job-postings/{$jobPosting->id}");

    $response->assertNotFound();
});

it('updates the authenticated company\'s own job posting', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create(['title' => '旧タイトル']);

    $response = $this->actingAs($company, 'company')->putJson(
        "/api/company/job-postings/{$jobPosting->id}",
        validJobPostingPayload(['title' => '新タイトル'])
    );

    $response->assertOk();
    expect($jobPosting->fresh()->title)->toBe('新タイトル');
});

it('prevents updating another company\'s job posting', function () {
    $company = Company::factory()->create();
    $other = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($other)->create();

    $response = $this->actingAs($company, 'company')->putJson(
        "/api/company/job-postings/{$jobPosting->id}",
        validJobPostingPayload()
    );

    $response->assertNotFound();
});

it('deletes the authenticated company\'s own job posting', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();

    $response = $this->actingAs($company, 'company')->deleteJson("/api/company/job-postings/{$jobPosting->id}");

    $response->assertNoContent();
    expect(JobPosting::find($jobPosting->id))->toBeNull();
});

it('prevents deleting another company\'s job posting', function () {
    $company = Company::factory()->create();
    $other = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($other)->create();

    $response = $this->actingAs($company, 'company')->deleteJson("/api/company/job-postings/{$jobPosting->id}");

    $response->assertNotFound();
    expect(JobPosting::find($jobPosting->id))->not->toBeNull();
});

it('rejects unauthenticated requests', function () {
    $this->getJson('/api/company/job-postings')->assertUnauthorized();
});
