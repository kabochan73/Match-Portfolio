<?php

namespace Database\Factories;

use App\Enums\Prefecture;
use App\Models\Company;
use App\Models\JobPosting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobPosting>
 */
class JobPostingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // 月給の下限を先に決め、上限はそれより高い額にする(salary_max >= salary_minを保証)
        $salaryMin = fake()->numberBetween(20, 60) * 10000;
        $salaryMax = $salaryMin + fake()->numberBetween(5, 20) * 10000;

        return [
            'company_id' => Company::factory(),
            'title' => fake()->jobTitle(),
            'description' => fake()->realText(300),
            'desired_candidate' => fake()->realText(200),
            'employment_type' => fake()->randomElement(['full_time', 'part_time', 'contract']),
            // job_postingsはcompaniesと共通のPrefecture enumに加えて「リモート」も選択肢に含む
            'prefecture' => fake()->randomElement([...Prefecture::values(), 'リモート']),
            'salary_min' => $salaryMin,
            'salary_max' => $salaryMax,
            'status' => 'draft',
            'published_at' => null,
        ];
    }
}
