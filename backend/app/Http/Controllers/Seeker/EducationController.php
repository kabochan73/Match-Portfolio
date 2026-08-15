<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\EducationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EducationController extends Controller
{
    /**
     * 認証中の求職者自身の学歴一覧
     */
    public function index(Request $request): JsonResponse
    {
        return response()->json($request->user('web')->educations);
    }

    public function store(EducationRequest $request): JsonResponse
    {
        $education = $request->user('web')->educations()->create($request->validated());

        return response()->json($education, 201);
    }

    /**
     * user()->educations()経由でIDを引くことで、他人の学歴を編集できないようスコープする
     * (存在しないIDと同様404を返すため、他人のレコードの存在有無も推測されない)
     */
    public function update(EducationRequest $request, int $education): JsonResponse
    {
        $model = $request->user('web')->educations()->findOrFail($education);

        $model->update($request->validated());

        return response()->json($model);
    }

    public function destroy(Request $request, int $education): Response
    {
        $request->user('web')->educations()->findOrFail($education)->delete();

        return response()->noContent();
    }
}
