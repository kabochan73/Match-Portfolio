<?php

use App\Models\Company;
use App\Models\JobPosting;
use App\Models\JobPostingImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('uploads an image for the authenticated company\'s job posting', function () {
    Storage::fake('public');
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();

    $response = $this->actingAs($company, 'company')->postJson("/api/company/job-postings/{$jobPosting->id}/images", [
        'image' => UploadedFile::fake()->image('photo.png'),
    ]);

    $response->assertCreated();
    $image = JobPostingImage::first();
    expect($image->job_posting_id)->toBe($jobPosting->id)
        ->and($image->position)->toBe(0);
    Storage::disk('public')->assertExists($image->path);
    expect($response->json('url'))->toContain($image->path);
});

it('appends subsequent images at the next position', function () {
    Storage::fake('public');
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    JobPostingImage::factory()->for($jobPosting)->create(['position' => 0]);

    $response = $this->actingAs($company, 'company')->postJson("/api/company/job-postings/{$jobPosting->id}/images", [
        'image' => UploadedFile::fake()->image('photo2.png'),
    ]);

    $response->assertCreated();
    expect($response->json('position'))->toBe(1);
});

it('rejects a 6th image for the same job posting', function () {
    Storage::fake('public');
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    JobPostingImage::factory()->for($jobPosting)->count(5)->sequence(fn ($sequence) => ['position' => $sequence->index])->create();

    $response = $this->actingAs($company, 'company')->postJson("/api/company/job-postings/{$jobPosting->id}/images", [
        'image' => UploadedFile::fake()->image('photo6.png'),
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('image');
});

it('rejects a non-image file', function () {
    Storage::fake('public');
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();

    $response = $this->actingAs($company, 'company')->postJson("/api/company/job-postings/{$jobPosting->id}/images", [
        'image' => UploadedFile::fake()->create('document.pdf', 100),
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('image');
});

it('prevents uploading an image to another company\'s job posting', function () {
    Storage::fake('public');
    $company = Company::factory()->create();
    $other = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($other)->create();

    $response = $this->actingAs($company, 'company')->postJson("/api/company/job-postings/{$jobPosting->id}/images", [
        'image' => UploadedFile::fake()->image('photo.png'),
    ]);

    $response->assertNotFound();
});

it('deletes an image belonging to the authenticated company\'s job posting', function () {
    Storage::fake('public');
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $image = JobPostingImage::factory()->for($jobPosting)->create();
    Storage::disk('public')->put($image->path, 'fake-contents');

    $response = $this->actingAs($company, 'company')->deleteJson("/api/company/job-postings/{$jobPosting->id}/images/{$image->id}");

    $response->assertNoContent();
    Storage::disk('public')->assertMissing($image->path);
    expect(JobPostingImage::find($image->id))->toBeNull();
});

it('prevents deleting an image belonging to another company\'s job posting', function () {
    $company = Company::factory()->create();
    $other = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($other)->create();
    $image = JobPostingImage::factory()->for($jobPosting)->create();

    $response = $this->actingAs($company, 'company')->deleteJson("/api/company/job-postings/{$jobPosting->id}/images/{$image->id}");

    $response->assertNotFound();
    expect(JobPostingImage::find($image->id))->not->toBeNull();
});

it('rejects unauthenticated requests', function () {
    $jobPosting = JobPosting::factory()->create();

    $response = $this->postJson("/api/company/job-postings/{$jobPosting->id}/images", [
        'image' => UploadedFile::fake()->image('photo.png'),
    ]);

    $response->assertUnauthorized();
});

it('includes job posting images when showing a job posting', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    JobPostingImage::factory()->for($jobPosting)->create();

    $response = $this->actingAs($company, 'company')->getJson("/api/company/job-postings/{$jobPosting->id}");

    $response->assertOk();
    expect($response->json('job_posting_images'))->toHaveCount(1);
});
