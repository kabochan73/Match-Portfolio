<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\CompanyImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CompanyImage>
 */
class CompanyImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'path' => 'company_images/'.fake()->uuid().'.jpg',
            'position' => 0,
        ];
    }
}
