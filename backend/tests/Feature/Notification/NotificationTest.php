<?php

use App\Models\Company;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;
use App\Notifications\LikeMatched;
use App\Notifications\NewApplication;
use App\Notifications\NewMessage;
use Illuminate\Support\Facades\Notification;

it('notifies the company when a seeker applies to their job posting', function () {
    Notification::fake();

    $user = User::factory()->create();
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create(['status' => 'published']);

    $this->actingAs($user, 'web')->postJson('/api/likes', [
        'job_posting_id' => $jobPosting->id,
        'like_type' => 'standard',
        'motivation' => '志望動機です',
    ])->assertCreated();

    Notification::assertSentTo($company, NewApplication::class);
});

it('notifies the seeker when a company matches their application', function () {
    Notification::fake();

    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $user = User::factory()->create();
    $like = Like::factory()->for($user)->for($jobPosting)->create([
        'status' => 'applied',
        'applied_at' => now(),
        'response_deadline' => now()->addDays(7),
    ]);

    $this->actingAs($company, 'company')->patchJson("/api/company/likes/{$like->id}/match")->assertOk();

    Notification::assertSentTo($user, LikeMatched::class);
});

it('notifies the company when the seeker sends a message', function () {
    Notification::fake();

    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $user = User::factory()->create();
    $like = Like::factory()->for($user)->for($jobPosting)->create(['status' => 'matched']);

    $this->actingAs($user, 'web')->postJson("/api/message-threads/{$like->id}/messages", [
        'body' => 'よろしくお願いします',
    ])->assertCreated();

    Notification::assertSentTo($company, NewMessage::class);
});

it('notifies the seeker when the company sends a message', function () {
    Notification::fake();

    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $user = User::factory()->create();
    $like = Like::factory()->for($user)->for($jobPosting)->create(['status' => 'matched']);

    $this->actingAs($company, 'company')->postJson("/api/company/message-threads/{$like->id}/messages", [
        'body' => 'ご連絡します',
    ])->assertCreated();

    Notification::assertSentTo($user, NewMessage::class);
});

it('lists notifications for the authenticated seeker', function () {
    $user = User::factory()->create();
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $like = Like::factory()->for($user)->for($jobPosting)->create(['status' => 'matched']);
    $user->notify(new LikeMatched($like));

    $response = $this->actingAs($user, 'web')->getJson('/api/notifications');

    $response->assertOk();
    expect($response->json())->toHaveCount(1)
        ->and($response->json('0.type'))->toBe(LikeMatched::class)
        ->and($response->json('0.data.job_posting_title'))->toBe($jobPosting->title);
});

it('lists notifications for the authenticated company', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $user = User::factory()->create(['name' => '応募太郎']);
    $like = Like::factory()->for($user)->for($jobPosting)->create();
    $company->notify(new NewApplication($like));

    $response = $this->actingAs($company, 'company')->getJson('/api/company/notifications');

    $response->assertOk();
    expect($response->json('0.data.applicant_name'))->toBe('応募太郎');
});

it('marks a notification as read', function () {
    $user = User::factory()->create();
    $like = Like::factory()->for($user)->create();
    $user->notify(new LikeMatched($like));
    $notificationId = $user->notifications()->first()->id;

    $response = $this->actingAs($user, 'web')->patchJson("/api/notifications/{$notificationId}/read");

    $response->assertNoContent();
    expect($user->notifications()->first()->read_at)->not->toBeNull();
});

it('prevents marking another user\'s notification as read', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $like = Like::factory()->for($other)->create();
    $other->notify(new LikeMatched($like));
    $notificationId = $other->notifications()->first()->id;

    $this->actingAs($user, 'web')->patchJson("/api/notifications/{$notificationId}/read")->assertNotFound();
});

it('rejects unauthenticated requests', function () {
    $this->getJson('/api/notifications')->assertUnauthorized();
    $this->getJson('/api/company/notifications')->assertUnauthorized();
});
