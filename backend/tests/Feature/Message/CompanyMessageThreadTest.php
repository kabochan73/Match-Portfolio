<?php

use App\Models\Company;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\Message;

it('lists only matched, non-hidden threads for the authenticated company', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $matched = Like::factory()->for($jobPosting)->create(['status' => 'matched']);
    Like::factory()->for($jobPosting)->create(['status' => 'applied']);
    Like::factory()->for($jobPosting)->create(['status' => 'matched', 'company_hidden_at' => now()]);

    $otherCompany = Company::factory()->create();
    $otherJobPosting = JobPosting::factory()->for($otherCompany)->create();
    Like::factory()->for($otherJobPosting)->create(['status' => 'matched']);

    $response = $this->actingAs($company, 'company')->getJson('/api/company/message-threads');

    $response->assertOk();
    expect($response->json('*.id'))->toBe([$matched->id]);
});

it('includes an unread count based on the user\'s unread messages', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $like = Like::factory()->for($jobPosting)->create(['status' => 'matched']);
    Message::factory()->for($like)->create();
    Message::factory()->for($like)->fromCompany()->create(); // 自分(company)からの送信は未読カウントに含めない

    $response = $this->actingAs($company, 'company')->getJson('/api/company/message-threads');

    $response->assertOk();
    expect($response->json('0.unread_messages_count'))->toBe(1);
});

it('hides a thread from the authenticated company\'s own list', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $like = Like::factory()->for($jobPosting)->create(['status' => 'matched']);

    $response = $this->actingAs($company, 'company')->patchJson("/api/company/message-threads/{$like->id}/hide");

    $response->assertNoContent();
    expect($like->fresh()->company_hidden_at)->not->toBeNull();
});

it('prevents hiding another company\'s thread', function () {
    $company = Company::factory()->create();
    $other = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($other)->create();
    $like = Like::factory()->for($jobPosting)->create(['status' => 'matched']);

    $this->actingAs($company, 'company')->patchJson("/api/company/message-threads/{$like->id}/hide")->assertNotFound();
});

it('lists thread messages oldest to newest and marks user messages as read', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $like = Like::factory()->for($jobPosting)->create(['status' => 'matched']);
    $older = Message::factory()->for($like)->create(['created_at' => now()->subHour()]);
    $newer = Message::factory()->for($like)->fromCompany()->create(['created_at' => now()]);

    $response = $this->actingAs($company, 'company')->getJson("/api/company/message-threads/{$like->id}/messages");

    $response->assertOk();
    expect($response->json('*.id'))->toBe([$older->id, $newer->id])
        ->and($older->fresh()->read_at)->not->toBeNull()
        ->and($newer->fresh()->read_at)->toBeNull();
});

it('rejects viewing messages for a non-matched like', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $like = Like::factory()->for($jobPosting)->create(['status' => 'applied']);

    $this->actingAs($company, 'company')->getJson("/api/company/message-threads/{$like->id}/messages")->assertNotFound();
});

it('sends a message as the company and resets the user\'s hidden_at', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $like = Like::factory()->for($jobPosting)->create(['status' => 'matched', 'user_hidden_at' => now()]);

    $response = $this->actingAs($company, 'company')->postJson("/api/company/message-threads/{$like->id}/messages", [
        'body' => 'ぜひ一度お話しさせてください',
    ]);

    $response->assertCreated();
    expect($response->json('sender_type'))->toBe('company')
        ->and($response->json('sender_id'))->toBe($company->id)
        ->and($like->fresh()->user_hidden_at)->toBeNull();
});

it('rejects sending a message to a non-matched like', function () {
    $company = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($company)->create();
    $like = Like::factory()->for($jobPosting)->create(['status' => 'applied']);

    $this->actingAs($company, 'company')->postJson("/api/company/message-threads/{$like->id}/messages", ['body' => 'hi'])
        ->assertNotFound();
});

it('prevents sending a message to another company\'s thread', function () {
    $company = Company::factory()->create();
    $other = Company::factory()->create();
    $jobPosting = JobPosting::factory()->for($other)->create();
    $like = Like::factory()->for($jobPosting)->create(['status' => 'matched']);

    $this->actingAs($company, 'company')->postJson("/api/company/message-threads/{$like->id}/messages", ['body' => 'hi'])
        ->assertNotFound();
});

it('rejects unauthenticated requests', function () {
    $jobPosting = JobPosting::factory()->create();
    $like = Like::factory()->for($jobPosting)->create(['status' => 'matched']);

    $this->getJson('/api/company/message-threads')->assertUnauthorized();
    $this->patchJson("/api/company/message-threads/{$like->id}/hide")->assertUnauthorized();
    $this->getJson("/api/company/message-threads/{$like->id}/messages")->assertUnauthorized();
    $this->postJson("/api/company/message-threads/{$like->id}/messages", ['body' => 'hi'])->assertUnauthorized();
});
