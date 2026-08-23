<?php

use App\Models\Company;
use App\Models\CompanyImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('uploads an image for the authenticated company\'s profile', function () {
    Storage::fake('public');
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson('/api/company/profile/images', [
        'image' => UploadedFile::fake()->image('photo.png'),
    ]);

    $response->assertCreated();
    $image = CompanyImage::first();
    expect($image->company_id)->toBe($company->id)
        ->and($image->position)->toBe(0);
    Storage::disk('public')->assertExists($image->path);
    expect($response->json('url'))->toContain($image->path);
});

it('appends subsequent images at the next position', function () {
    Storage::fake('public');
    $company = Company::factory()->create();
    CompanyImage::factory()->for($company)->create(['position' => 0]);

    $response = $this->actingAs($company, 'company')->postJson('/api/company/profile/images', [
        'image' => UploadedFile::fake()->image('photo2.png'),
    ]);

    $response->assertCreated();
    expect($response->json('position'))->toBe(1);
});

it('rejects a 6th image for the same company', function () {
    Storage::fake('public');
    $company = Company::factory()->create();
    CompanyImage::factory()->for($company)->count(5)->sequence(fn ($sequence) => ['position' => $sequence->index])->create();

    $response = $this->actingAs($company, 'company')->postJson('/api/company/profile/images', [
        'image' => UploadedFile::fake()->image('photo6.png'),
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('image');
});

it('rejects a non-image file', function () {
    Storage::fake('public');
    $company = Company::factory()->create();

    $response = $this->actingAs($company, 'company')->postJson('/api/company/profile/images', [
        'image' => UploadedFile::fake()->create('document.pdf', 100),
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('image');
});

it('deletes an image belonging to the authenticated company', function () {
    Storage::fake('public');
    $company = Company::factory()->create();
    $image = CompanyImage::factory()->for($company)->create();
    Storage::disk('public')->put($image->path, 'fake-contents');

    $response = $this->actingAs($company, 'company')->deleteJson("/api/company/profile/images/{$image->id}");

    $response->assertNoContent();
    Storage::disk('public')->assertMissing($image->path);
    expect(CompanyImage::find($image->id))->toBeNull();
});

it('prevents deleting an image belonging to another company', function () {
    $company = Company::factory()->create();
    $other = Company::factory()->create();
    $image = CompanyImage::factory()->for($other)->create();

    $response = $this->actingAs($company, 'company')->deleteJson("/api/company/profile/images/{$image->id}");

    $response->assertNotFound();
    expect(CompanyImage::find($image->id))->not->toBeNull();
});

it('rejects unauthenticated requests', function () {
    $response = $this->postJson('/api/company/profile/images', [
        'image' => UploadedFile::fake()->image('photo.png'),
    ]);

    $response->assertUnauthorized();
});

it('includes images when showing the authenticated company\'s profile', function () {
    $company = Company::factory()->create();
    CompanyImage::factory()->for($company)->create();

    $response = $this->actingAs($company, 'company')->getJson('/api/company/profile');

    $response->assertOk();
    expect($response->json('images'))->toHaveCount(1);
});

it('includes images on the public company profile endpoint', function () {
    $company = Company::factory()->create();
    CompanyImage::factory()->for($company)->create();

    $response = $this->getJson("/api/companies/{$company->id}");

    $response->assertOk();
    expect($response->json('images'))->toHaveCount(1);
});
