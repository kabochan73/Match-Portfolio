<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\CertificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CertificationController extends Controller
{
    /**
     * 認証中の求職者自身の資格一覧
     */
    public function index(Request $request): JsonResponse
    {
        return response()->json($request->user('web')->certifications);
    }

    public function store(CertificationRequest $request): JsonResponse
    {
        $certification = $request->user('web')->certifications()->create($request->validated());

        return response()->json($certification, 201);
    }

    /**
     * user()->certifications()経由でIDを引くことで、他人の資格を編集できないようスコープする
     * (存在しないIDと同様404を返すため、他人のレコードの存在有無も推測されない)
     */
    public function update(CertificationRequest $request, int $certification): JsonResponse
    {
        $model = $request->user('web')->certifications()->findOrFail($certification);

        $model->update($request->validated());

        return response()->json($model);
    }

    public function destroy(Request $request, int $certification): Response
    {
        $request->user('web')->certifications()->findOrFail($certification)->delete();

        return response()->noContent();
    }
}
