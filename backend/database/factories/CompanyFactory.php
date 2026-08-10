<?php

namespace Database\Factories;

use App\Enums\MemberCountRange;
use App\Enums\Prefecture;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<Company>
 */
class CompanyFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'email' => fake()->unique()->companyEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'description' => fake()->optional()->realText(200),
            'phone_number' => fake()->optional()->phoneNumber(),
            'prefecture' => fake()->randomElement(Prefecture::cases()),
            'address_line' => fake()->optional()->streetAddress(),
            'founded_year' => fake()->optional()->numberBetween(1950, 2025),
            'member_count_range' => fake()->randomElement(MemberCountRange::cases()),
            'website_url' => fake()->optional()->url(),
        ];
    }
}
