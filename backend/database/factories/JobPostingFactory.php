<?php

namespace Database\Factories;

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
            'prefecture' => fake()->randomElement([
                '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
                '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
                '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
                '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
                '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
                '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
                '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県', 'リモート',
            ]),
            'salary_min' => $salaryMin,
            'salary_max' => $salaryMax,
            'status' => 'draft',
            'published_at' => null,
        ];
    }
}
