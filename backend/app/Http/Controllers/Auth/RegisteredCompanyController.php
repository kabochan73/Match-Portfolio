<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterCompanyRequest;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class RegisteredCompanyController extends Controller
{
    /**
     * 企業の会員登録。メール認証は要件に含まれないため、登録と同時にログイン状態にする
     */
    public function store(RegisterCompanyRequest $request): JsonResponse
    {
        $company = Company::create($request->validated());

        Auth::guard('company')->login($company);

        $request->session()->regenerate();

        return response()->json($company, 201);
    }
}
