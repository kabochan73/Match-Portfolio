<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;

/**
 * 未認証の求職者・訪問者向けの公開企業プロフィールエンドポイント
 */
class CompanyController extends Controller
{
    public function show(int $company): JsonResponse
    {
        $model = Company::query()
            ->select(Company::publicColumns())
            ->findOrFail($company);

        return response()->json($model);
    }
}
