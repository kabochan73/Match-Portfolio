<?php

use App\Enums\JobPostingStatus;
use App\Models\Company;
use App\Models\JobPosting;

it('publishes a draft job posting and sets published_at', function () {
    $company = Company::factory()->create();
    createSubscriptionFor($company, 'active');
    $jobPosting = JobPosting::factory()->for($company)->create(['status' => 'draft', 'published_at' => null]);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/job-postings/{$jobPosting->id}/publish");

    $response->assertOk();
    expect($jobPosting->fresh())
        ->status->toBe(JobPostingStatus::Published)
        ->published_at->not->toBeNull();
});

it('republishes a job posting that was auto-unpublished for non-payment', function () {
    $company = Company::factory()->create();
    createSubscriptionFor($company, 'active');
    $jobPosting = JobPosting::factory()->for($company)->create([
        'status' => 'unpublished',
        'published_at' => now()->subDays(10),
    ]);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/job-postings/{$jobPosting->id}/publish");

    $response->assertOk();
    expect($jobPosting->fresh()->status)->toBe(JobPostingStatus::Published);
});

it('rejects publishing when the company has no active subscription', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create(['status' => 'draft']);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/job-postings/{$jobPosting->id}/publish");

    $response->assertUnprocessable()->assertJsonValidationErrors('billing');
});

it('does not overwrite published_at when republishing', function () {
    $company = Company::factory()->create();
    createSubscriptionFor($company, 'active');
    $firstPublishedAt = now()->subDays(10);
    $jobPosting = JobPosting::factory()->for($company)->create([
        'status' => 'draft',
        'published_at' => $firstPublishedAt,
    ]);

    $this->actingAs($company, 'company')->patchJson("/api/company/job-postings/{$jobPosting->id}/publish");

    expect($jobPosting->fresh()->published_at->toDateTimeString())->toBe($firstPublishedAt->toDateTimeString());
});

it('rejects publishing a job posting that is not a draft', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create(['status' => 'published']);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/job-postings/{$jobPosting->id}/publish");

    $response->assertUnprocessable()->assertJsonValidationErrors('status');
});

it('unpublishes a published job posting back to draft', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create(['status' => 'published']);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/job-postings/{$jobPosting->id}/unpublish");

    $response->assertOk();
    expect($jobPosting->fresh()->status)->toBe(JobPostingStatus::Draft);
});

it('rejects unpublishing a job posting that is not published', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create(['status' => 'draft']);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/job-postings/{$jobPosting->id}/unpublish");

    $response->assertUnprocessable()->assertJsonValidationErrors('status');
});

it('closes a published job posting', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create(['status' => 'published']);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/job-postings/{$jobPosting->id}/close");

    $response->assertOk();
    expect($jobPosting->fresh()->status)->toBe(JobPostingStatus::Closed);
});

it('closes a draft job posting', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create(['status' => 'draft']);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/job-postings/{$jobPosting->id}/close");

    $response->assertOk();
    expect($jobPosting->fresh()->status)->toBe(JobPostingStatus::Closed);
});

it('rejects closing a job posting that is already closed', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create(['status' => 'closed']);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/job-postings/{$jobPosting->id}/close");

    $response->assertUnprocessable()->assertJsonValidationErrors('status');
});

it('prevents publishing another company\'s job posting', function () {
    $company = Company::factory()->create();
    $other = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($other)->create(['status' => 'draft']);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/job-postings/{$jobPosting->id}/publish");

    $response->assertNotFound();
});
