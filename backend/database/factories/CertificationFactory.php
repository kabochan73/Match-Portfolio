<?php

namespace Database\Factories;

use App\Models\Certification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Certification>
 */
class CertificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement([
                '基本情報技術者試験',
                '応用情報技術者試験',
                'TOEIC 800点',
                '普通自動車第一種運転免許',
                'AWS認定ソリューションアーキテクト',
            ]),
        ];
    }
}
