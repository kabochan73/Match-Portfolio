<?php

use App\Enums\LikeStatus;
use App\Models\Company;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;
use App\Models\WorkExperience;

it('lists applicants for the authenticated company\'s own job posting, newest first', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $user = User::factory()->create(['name' => '応募太郎']);
    $older = Like::factory()->for($jobPosting)->create(['applied_at' => now()->subDays(2)]);
    $newer = Like::factory()->for($user)->for($jobPosting)->create(['applied_at' => now()->subDay()]);

    $response = $this->actingAs($company, 'company')->getJson("/api/company/job-postings/{$jobPosting->id}/likes");

    $response->assertOk();
    expect($response->json('*.id'))->toBe([$newer->id, $older->id])
        ->and($response->json('0.user.name'))->toBe('応募太郎');
});

it('excludes applicants the company has hidden from its own applicant list', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $visible = Like::factory()->for($jobPosting)->create();
    Like::factory()->for($jobPosting)->create(['company_hidden_at' => now()]);

    $response = $this->actingAs($company, 'company')->getJson("/api/company/job-postings/{$jobPosting->id}/likes");

    $response->assertOk();
    expect($response->json('*.id'))->toBe([$visible->id]);
});

it('prevents listing applicants for another company\'s job posting', function () {
    $company = Company::factory()->create();
    $other = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($other)->create();

    $response = $this->actingAs($company, 'company')->getJson("/api/company/job-postings/{$jobPosting->id}/likes");

    $response->assertNotFound();
});

it('shows an applicant\'s profile including work experience for the authenticated company', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $user = User::factory()->create();
    WorkExperience::factory()->for($user)->create(['company_name' => '前職株式会社']);
    $like = Like::factory()->for($user)->for($jobPosting)->create(['motivation' => '志望動機です']);

    $response = $this->actingAs($company, 'company')->getJson("/api/company/likes/{$like->id}");

    $response->assertOk();
    expect($response->json('motivation'))->toBe('志望動機です')
        ->and($response->json('user.work_experiences.0.company_name'))->toBe('前職株式会社')
        ->and($response->json('user'))->not->toHaveKey('email');
});

it('prevents viewing an applicant of another company\'s job posting', function () {
    $company = Company::factory()->create();
    $other = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($other)->create();
    $like = Like::factory()->for($jobPosting)->create();

    $response = $this->actingAs($company, 'company')->getJson("/api/company/likes/{$like->id}");

    $response->assertNotFound();
});

it('lets a company mark an applicant as matched', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $like = Like::factory()->for($jobPosting)->create([
        'status' => 'applied',
        'applied_at' => now(),
        'response_deadline' => now()->addDays(7),
    ]);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/likes/{$like->id}/match");

    $response->assertOk();
    expect($like->fresh()->status)->toBe(LikeStatus::Matched->value)
        ->and($like->fresh()->company_responded_at)->not->toBeNull();
});

it('rejects matching an applicant that is already matched', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $like = Like::factory()->for($jobPosting)->create(['status' => 'matched']);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/likes/{$like->id}/match");

    $response->assertUnprocessable()->assertJsonValidationErrors('status');
});

it('rejects matching an applicant whose response deadline has passed', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $like = Like::factory()->for($jobPosting)->create([
        'status' => 'applied',
        'applied_at' => now()->subDays(10),
        'response_deadline' => now()->subDays(3),
    ]);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/likes/{$like->id}/match");

    $response->assertUnprocessable()->assertJsonValidationErrors('status');
});

it('prevents matching an applicant of another company\'s job posting', function () {
    $company = Company::factory()->create();
    $other = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($other)->create();
    $like = Like::factory()->for($jobPosting)->create(['status' => 'applied']);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/likes/{$like->id}/match");

    $response->assertNotFound();
});

it('lets a company hide an applicant from its applicant list regardless of match status', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $like = Like::factory()->for($jobPosting)->create(['status' => 'matched']);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/likes/{$like->id}/hide");

    $response->assertNoContent();
    expect($like->fresh()->company_hidden_at)->not->toBeNull();
});

it('prevents hiding an applicant of another company\'s job posting', function () {
    $company = Company::factory()->create();
    $other = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($other)->create();
    $like = Like::factory()->for($jobPosting)->create();

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/likes/{$like->id}/hide");

    $response->assertNotFound();
    expect($like->fresh()->company_hidden_at)->toBeNull();
});

it('rejects unauthenticated requests', function () {
    $jobPosting = JobPosting::factory()->create();
    $like = Like::factory()->for($jobPosting)->create();

    $this->getJson("/api/company/job-postings/{$jobPosting->id}/likes")->assertUnauthorized();
    $this->getJson("/api/company/likes/{$like->id}")->assertUnauthorized();
    $this->patchJson("/api/company/likes/{$like->id}/match")->assertUnauthorized();
    $this->patchJson("/api/company/likes/{$like->id}/hide")->assertUnauthorized();
});
