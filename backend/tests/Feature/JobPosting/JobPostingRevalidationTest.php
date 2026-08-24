<?php

use App\Models\Company;
use App\Models\JobPosting;
use App\Models\JobPostingImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

// /companies/[id]の「掲載中の求人」欄(company-{id}タグ)が、企業側の求人操作の直後に
// 再検証されることを確認する。job-posting-{id}タグ自体の送信は既存の各エンドポイントの
// 挙動そのものであり、ここではcompany-{id}タグが追加で送られることだけを検証する
beforeEach(function () {
    config(['services.nextjs.internal_url' => 'http://frontend:3000']);
    Http::fake(['frontend:3000/api/revalidate' => Http::response(['revalidated' => true], 200)]);
});

it('revalidates the company tag when a job posting is updated', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();

    $this->actingAs($company, 'company')->putJson("/api/company/job-postings/{$jobPosting->id}", [
        'title' => '新タイトル',
        'description' => '説明',
        'desired_candidate' => '求める人物像',
        'employment_type' => 'full_time',
        'prefecture' => '東京都',
        'salary_min' => 300000,
        'salary_max' => 500000,
    ])->assertOk();

    Http::assertSent(fn ($request) => $request['tag'] === "company-{$company->id}");
});

it('revalidates the company tag when a job posting is published', function () {
    $company = Company::factory()->create();
    createSubscriptionFor($company, 'active');
    $jobPosting = JobPosting::factory()->for($company)->create(['status' => 'draft']);

    $this->actingAs($company, 'company')->patchJson("/api/company/job-postings/{$jobPosting->id}/publish")->assertOk();

    Http::assertSent(fn ($request) => $request['tag'] === "company-{$company->id}");
});

it('revalidates the company tag when a job posting is unpublished', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create(['status' => 'published']);

    $this->actingAs($company, 'company')->patchJson("/api/company/job-postings/{$jobPosting->id}/unpublish")->assertOk();

    Http::assertSent(fn ($request) => $request['tag'] === "company-{$company->id}");
});

it('revalidates the company tag when a job posting is closed', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create(['status' => 'published']);

    $this->actingAs($company, 'company')->patchJson("/api/company/job-postings/{$jobPosting->id}/close")->assertOk();

    Http::assertSent(fn ($request) => $request['tag'] === "company-{$company->id}");
});

it('revalidates the company tag when a job posting is deleted', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();

    $this->actingAs($company, 'company')->deleteJson("/api/company/job-postings/{$jobPosting->id}")->assertNoContent();

    Http::assertSent(fn ($request) => $request['tag'] === "company-{$company->id}");
});

it('revalidates the company tag when a job posting image is uploaded', function () {
    Storage::fake('public');
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();

    $this->actingAs($company, 'company')->postJson("/api/company/job-postings/{$jobPosting->id}/images", [
        'image' => UploadedFile::fake()->image('photo.png'),
    ])->assertCreated();

    Http::assertSent(fn ($request) => $request['tag'] === "company-{$company->id}");
});

it('revalidates the company tag when a job posting image is deleted', function () {
    Storage::fake('public');
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $image = JobPostingImage::factory()->for($jobPosting)->create();

    $this->actingAs($company, 'company')->deleteJson("/api/company/job-postings/{$jobPosting->id}/images/{$image->id}")->assertNoContent();

    Http::assertSent(fn ($request) => $request['tag'] === "company-{$company->id}");
});
