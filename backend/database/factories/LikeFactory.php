<?php

namespace Database\Factories;

use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Like>
 */
class LikeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $appliedAt = fake()->dateTimeBetween('-30 days', 'now');

        return [
            'user_id' => User::factory(),
            'job_posting_id' => JobPosting::factory(),
            'like_type' => 'standard',
            'motivation' => fake()->realText(200),
            'status' => 'applied',
            'applied_at' => $appliedAt,
            // response_deadlineはapplied_atの7日後、というDB_DESIGN.mdのルールをfactoryでも再現する
            'response_deadline' => (clone $appliedAt)->modify('+7 days'),
        ];
    }
}
