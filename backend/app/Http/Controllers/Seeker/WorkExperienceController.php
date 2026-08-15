<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\WorkExperienceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WorkExperienceController extends Controller
{
    /**
     * 認証中の求職者自身の職歴一覧(started_on降順)
     */
    public function index(Request $request): JsonResponse
    {
        return response()->json($request->user('web')->workExperiences);
    }

    public function store(WorkExperienceRequest $request): JsonResponse
    {
        $workExperience = $request->user('web')->workExperiences()->create($request->validated());

        return response()->json($workExperience, 201);
    }

    /**
     * user()->workExperiences()経由でIDを引くことで、他人の職歴を編集できないようスコープする
     * (存在しないIDと同様404を返すため、他人のレコードの存在有無も推測されない)
     */
    public function update(WorkExperienceRequest $request, int $workExperience): JsonResponse
    {
        $model = $request->user('web')->workExperiences()->findOrFail($workExperience);

        $model->update($request->validated());

        return response()->json($model);
    }

    public function destroy(Request $request, int $workExperience): Response
    {
        $request->user('web')->workExperiences()->findOrFail($workExperience)->delete();

        return response()->noContent();
    }
}
