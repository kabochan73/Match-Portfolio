<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('uploads a profile image for the authenticated user', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'web')->postJson('/api/profile/avatar', [
        'image' => UploadedFile::fake()->image('avatar.png'),
    ]);

    $response->assertOk();
    $user->refresh();
    expect($user->avatar_path)->not->toBeNull();
    Storage::disk('public')->assertExists($user->avatar_path);
    expect($response->json('avatar_url'))->toContain($user->avatar_path);
});

it('replaces the previous profile image and removes the old file', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $this->actingAs($user, 'web')->postJson('/api/profile/avatar', [
        'image' => UploadedFile::fake()->image('avatar.png'),
    ]);
    $oldPath = $user->refresh()->avatar_path;

    $this->actingAs($user, 'web')->postJson('/api/profile/avatar', [
        'image' => UploadedFile::fake()->image('avatar2.png'),
    ]);

    $user->refresh();
    Storage::disk('public')->assertMissing($oldPath);
    Storage::disk('public')->assertExists($user->avatar_path);
});

it('rejects a non-image file', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'web')->postJson('/api/profile/avatar', [
        'image' => UploadedFile::fake()->create('document.pdf', 100),
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('image');
});

it('rejects unauthenticated requests', function () {
    $response = $this->postJson('/api/profile/avatar', [
        'image' => UploadedFile::fake()->image('avatar.png'),
    ]);

    $response->assertUnauthorized();
});

it('deletes the profile image', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $this->actingAs($user, 'web')->postJson('/api/profile/avatar', [
        'image' => UploadedFile::fake()->image('avatar.png'),
    ]);
    $path = $user->refresh()->avatar_path;

    $response = $this->actingAs($user, 'web')->deleteJson('/api/profile/avatar');

    $response->assertNoContent();
    Storage::disk('public')->assertMissing($path);
    expect($user->refresh()->avatar_path)->toBeNull();
});
