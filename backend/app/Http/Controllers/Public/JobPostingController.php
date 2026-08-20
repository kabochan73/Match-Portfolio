<?php

namespace App\Http\Controllers\Public;

use App\Enums\JobPostingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\SearchJobPostingsRequest;
use App\Models\Company;
use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;

/**
 * 未認証の求職者・訪問者向けの公開求人エンドポイント。公開中(published)の求人のみを対象とし、
 * 下書き・非公開・募集終了の求人は一覧にも詳細にも出さない(URLを知っていても閲覧不可)
 */
class JobPostingController extends Controller
{
    /**
     * 求人検索・一覧。キーワード(タイトル・職務内容)・勤務地・雇用形態で絞り込む(すべて任意)
     */
    public function index(SearchJobPostingsRequest $request): JsonResponse
    {
        $jobPostings = JobPosting::query()
            ->where('status', JobPostingStatus::Published)
            ->when($request->validated('keyword'), function ($query, $keyword) {
                $query->where(function ($query) use ($keyword) {
                    $query->where('title', 'like', "%{$keyword}%")
                        ->orWhere('description', 'like', "%{$keyword}%");
                });
            })
            ->when($request->validated('prefecture'), fn ($query, $prefecture) => $query->where('prefecture', $prefecture))
            ->when($request->validated('employment_type'), fn ($query, $employmentType) => $query->where('employment_type', $employmentType))
            // avatar_urlはavatar_pathから計算されるアクセサ(実カラムではない)なので、
            // select対象にはavatar_pathを指定する。avatar_urlはCompanyモデルのAppends指定により
            // JSONシリアライズ時に自動で付与される
            ->with('company:id,name,avatar_path,prefecture')
            ->withCount('likes')
            ->latest('published_at')
            ->get();

        return response()->json($jobPostings);
    }

    /**
     * 求人詳細。公開中でない、または存在しない場合は404(下書き等の存在有無を推測されないようにする)
     */
    public function show(int $jobPosting): JsonResponse
    {
        $model = JobPosting::query()
            ->where('status', JobPostingStatus::Published)
            // emailを含む全カラムをそのまま公開しないよう、Company::publicColumns()に絞る
            ->with(['company' => fn ($query) => $query->select(Company::publicColumns())])
            ->with('jobPostingImages')
            ->withCount('likes')
            ->findOrFail($jobPosting);

        return response()->json($model);
    }
}
