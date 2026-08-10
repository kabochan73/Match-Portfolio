<?php

use App\Models\Company;
use App\Models\Like;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\QueryException;

it('creates a message belonging to a like thread', function () {
    $like = Like::factory()->create();
    $message = Message::factory()->for($like)->create();

    expect($message->like->is($like))->toBeTrue()
        ->and($like->messages->pluck('id')->all())->toBe([$message->id]);
});

it('resolves the sender to a User model via the morph map', function () {
    $message = Message::factory()->create();

    expect($message->sender)->toBeInstanceOf(User::class);
});

it('resolves the sender to a Company model when sent from the company side', function () {
    $message = Message::factory()->fromCompany()->create();

    expect($message->sender)->toBeInstanceOf(Company::class);
});

it('orders messages within a thread from oldest to newest', function () {
    $like = Like::factory()->create();
    $newer = Message::factory()->for($like)->create(['created_at' => now()]);
    $older = Message::factory()->for($like)->create(['created_at' => now()->subDay()]);

    expect($like->messages->pluck('id')->all())->toBe([$older->id, $newer->id]);
});

it('rejects an invalid sender_type via the DB check constraint', function () {
    expect(fn () => Message::factory()->create(['sender_type' => 'invalid_sender']))
        ->toThrow(QueryException::class);
});
