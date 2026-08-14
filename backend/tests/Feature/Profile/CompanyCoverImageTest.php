<?php

use App\Models\Company;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('uploads a cover image for the authenticated company', function () {
    Storage::fake('public');
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson('/api/company/profile/cover-image', [
        'image' => UploadedFile::fake()->image('cover.png'),
    ]);

    $response->assertOk();
    $company->refresh();
    expect($company->cover_image_path)->not->toBeNull();
    Storage::disk('public')->assertExists($company->cover_image_path);
    expect($response->json('cover_image_url'))->toContain($company->cover_image_path);
});

it('replaces the previous cover image and removes the old file', function () {
    Storage::fake('public');
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')->postJson('/api/company/profile/cover-image', [
        'image' => UploadedFile::fake()->image('cover.png'),
    ]);
    $oldPath = $company->refresh()->cover_image_path;

    $this->actingAs($company, 'company')->postJson('/api/company/profile/cover-image', [
        'image' => UploadedFile::fake()->image('cover2.png'),
    ]);

    $company->refresh();
    Storage::disk('public')->assertMissing($oldPath);
    Storage::disk('public')->assertExists($company->cover_image_path);
});

it('rejects a non-image file', function () {
    Storage::fake('public');
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson('/api/company/profile/cover-image', [
        'image' => UploadedFile::fake()->create('document.pdf', 100),
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('image');
});

it('rejects unauthenticated requests', function () {
    $response = $this->postJson('/api/company/profile/cover-image', [
        'image' => UploadedFile::fake()->image('cover.png'),
    ]);

    $response->assertUnauthorized();
});

it('deletes the cover image', function () {
    Storage::fake('public');
    $company = Company::factory()->create();

    $this->actingAs($company, 'company')->postJson('/api/company/profile/cover-image', [
        'image' => UploadedFile::fake()->image('cover.png'),
    ]);
    $path = $company->refresh()->cover_image_path;

    $response = $this->actingAs($company, 'company')->deleteJson('/api/company/profile/cover-image');

    $response->assertNoContent();
    Storage::disk('public')->assertMissing($path);
    expect($company->refresh()->cover_image_path)->toBeNull();
});
