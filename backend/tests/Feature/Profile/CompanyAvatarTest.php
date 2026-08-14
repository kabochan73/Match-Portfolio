<?php

use App\Models\Company;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('uploads a profile image for the authenticated company', function () {
    Storage::fake('public');
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson('/api/company/profile/avatar', [
        'image' => UploadedFile::fake()->image('avatar.png'),
    ]);

    $response->assertOk();
    $company->refresh();
    expect($company->avatar_path)->not->toBeNull();
    Storage::disk('public')->assertExists($company->avatar_path);
    expect($response->json('avatar_url'))->toContain($company->avatar_path);
});

it('replaces the previous profile image and removes the old file', function () {
    Storage::fake('public');
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')->postJson('/api/company/profile/avatar', [
        'image' => UploadedFile::fake()->image('avatar.png'),
    ]);
    $oldPath = $company->refresh()->avatar_path;

    $this->actingAs($company, 'company')->postJson('/api/company/profile/avatar', [
        'image' => UploadedFile::fake()->image('avatar2.png'),
    ]);

    $company->refresh();
    Storage::disk('public')->assertMissing($oldPath);
    Storage::disk('public')->assertExists($company->avatar_path);
});

it('rejects a non-image file', function () {
    Storage::fake('public');
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson('/api/company/profile/avatar', [
        'image' => UploadedFile::fake()->create('document.pdf', 100),
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('image');
});

it('rejects unauthenticated requests', function () {
    $response = $this->postJson('/api/company/profile/avatar', [
        'image' => UploadedFile::fake()->image('avatar.png'),
    ]);

    $response->assertUnauthorized();
});

it('deletes the profile image', function () {
    Storage::fake('public');
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')->postJson('/api/company/profile/avatar', [
        'image' => UploadedFile::fake()->image('avatar.png'),
    ]);
    $path = $company->refresh()->avatar_path;

    $response = $this->actingAs($company, 'company')->deleteJson('/api/company/profile/avatar');

    $response->assertNoContent();
    Storage::disk('public')->assertMissing($path);
    expect($company->refresh()->avatar_path)->toBeNull();
});
