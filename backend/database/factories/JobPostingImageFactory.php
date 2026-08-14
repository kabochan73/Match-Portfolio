<?php

namespace Database\Factories;

use App\Models\JobPosting;
use App\Models\JobPostingImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobPostingImage>
 */
class JobPostingImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'job_posting_id' => JobPosting::factory(),
            'path' => 'job_posting_images/'.fake()->uuid().'.jpg',
            'position' => 0,
        ];
    }
}
