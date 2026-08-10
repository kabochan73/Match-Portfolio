<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Like;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'like_id' => Like::factory(),
            // デフォルトの送信者は求職者側。企業からの送信を作りたい場合はfromCompany()状態を使う
            'sender_type' => 'user',
            'sender_id' => User::factory(),
            'body' => fake()->realText(100),
            'read_at' => null,
        ];
    }

    /**
     * 送信者を企業側にする状態
     */
    public function fromCompany(): static
    {
        return $this->state(fn (array $attributes) => [
            'sender_type' => 'company',
            'sender_id' => Company::factory(),
        ]);
    }
}
