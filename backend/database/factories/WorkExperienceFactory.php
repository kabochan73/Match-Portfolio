<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\WorkExperience;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkExperience>
 */
class WorkExperienceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startedOn = fake()->dateTimeBetween('-10 years', '-1 years');

        return [
            'user_id' => User::factory(),
            'company_name' => fake()->company(),
            'started_on' => $startedOn->format('Y-m-d'),
            // 7割は退職済み(ended_onあり)、3割は在籍中(null)というイメージ
            'ended_on' => fake()->boolean(70)
                ? fake()->dateTimeBetween($startedOn, 'now')->format('Y-m-d')
                : null,
            'employment_type' => fake()->randomElement(['full_time', 'part_time', 'contract']),
        ];
    }
}
