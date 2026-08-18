<?php

use App\Models\Company;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\Message;
use App\Models\User;

it('lists only matched, non-hidden threads for the authenticated user', function () {
    $user = User::factory()->create();
    $matched = Like::factory()->for($user)->create(['status' => 'matched']);
    Like::factory()->for($user)->create(['status' => 'applied']);
    Like::factory()->for($user)->create(['status' => 'matched', 'user_hidden_at' => now()]);

    $response = $this->actingAs($user, 'web')->getJson('/api/message-threads');

    $response->assertOk();
    expect($response->json('*.id'))->toBe([$matched->id]);
});

it('includes an unread count based on the other party\'s unread messages', function () {
    $user = User::factory()->create();
    $like = Like::factory()->for($user)->create(['status' => 'matched']);
    Message::factory()->for($like)->fromCompany()->create();
    Message::factory()->for($like)->fromCompany()->create();
    Message::factory()->for($like)->create(); // 自分(user)からの送信は未読カウントに含めない

    $response = $this->actingAs($user, 'web')->getJson('/api/message-threads');

    $response->assertOk();
    expect($response->json('0.unread_messages_count'))->toBe(2);
});

it('hides a thread from the authenticated user\'s own list', function () {
    $user = User::factory()->create();
    $like = Like::factory()->for($user)->create(['status' => 'matched']);

    $response = $this->actingAs($user, 'web')->patchJson("/api/message-threads/{$like->id}/hide");

    $response->assertNoContent();
    expect($like->fresh()->user_hidden_at)->not->toBeNull();
});

it('rejects hiding a non-matched like', function () {
    $user = User::factory()->create();
    $like = Like::factory()->for($user)->create(['status' => 'applied']);

    $this->actingAs($user, 'web')->patchJson("/api/message-threads/{$like->id}/hide")->assertNotFound();
});

it('prevents hiding another user\'s thread', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $like = Like::factory()->for($other)->create(['status' => 'matched']);

    $this->actingAs($user, 'web')->patchJson("/api/message-threads/{$like->id}/hide")->assertNotFound();
});

it('lists thread messages oldest to newest and marks company messages as read', function () {
    $user = User::factory()->create();
    $like = Like::factory()->for($user)->create(['status' => 'matched']);
    $older = Message::factory()->for($like)->fromCompany()->create(['created_at' => now()->subHour()]);
    $newer = Message::factory()->for($like)->create(['created_at' => now()]);

    $response = $this->actingAs($user, 'web')->getJson("/api/message-threads/{$like->id}/messages");

    $response->assertOk();
    expect($response->json('*.id'))->toBe([$older->id, $newer->id])
        ->and($older->fresh()->read_at)->not->toBeNull()
        ->and($newer->fresh()->read_at)->toBeNull();
});

it('rejects viewing messages for a non-matched like', function () {
    $user = User::factory()->create();
    $like = Like::factory()->for($user)->create(['status' => 'applied']);

    $this->actingAs($user, 'web')->getJson("/api/message-threads/{$like->id}/messages")->assertNotFound();
});

it('sends a message as the user and resets the company\'s hidden_at', function () {
    $user = User::factory()->create();
    $like = Like::factory()->for($user)->create(['status' => 'matched', 'company_hidden_at' => now()]);

    $response = $this->actingAs($user, 'web')->postJson("/api/message-threads/{$like->id}/messages", [
        'body' => 'よろしくお願いします',
    ]);

    $response->assertCreated();
    expect($response->json('sender_type'))->toBe('user')
        ->and($response->json('sender_id'))->toBe($user->id)
        ->and($like->fresh()->company_hidden_at)->toBeNull();
});

it('rejects sending a message to a non-matched like', function () {
    $user = User::factory()->create();
    $like = Like::factory()->for($user)->create(['status' => 'applied']);

    $this->actingAs($user, 'web')->postJson("/api/message-threads/{$like->id}/messages", ['body' => 'hi'])
        ->assertNotFound();
});

it('prevents sending a message to another user\'s thread', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $like = Like::factory()->for($other)->create(['status' => 'matched']);

    $this->actingAs($user, 'web')->postJson("/api/message-threads/{$like->id}/messages", ['body' => 'hi'])
        ->assertNotFound();
});

it('rejects a message without a body', function () {
    $user = User::factory()->create();
    $like = Like::factory()->for($user)->create(['status' => 'matched']);

    $this->actingAs($user, 'web')->postJson("/api/message-threads/{$like->id}/messages", ['body' => ''])
        ->assertUnprocessable()->assertJsonValidationErrors('body');
});

it('rejects unauthenticated requests', function () {
    $jobPosting = JobPosting::factory()->for(Company::factory())->create();
    $like = Like::factory()->for($jobPosting)->create(['status' => 'matched']);

    $this->getJson('/api/message-threads')->assertUnauthorized();
    $this->patchJson("/api/message-threads/{$like->id}/hide")->assertUnauthorized();
    $this->getJson("/api/message-threads/{$like->id}/messages")->assertUnauthorized();
    $this->postJson("/api/message-threads/{$like->id}/messages", ['body' => 'hi'])->assertUnauthorized();
});
