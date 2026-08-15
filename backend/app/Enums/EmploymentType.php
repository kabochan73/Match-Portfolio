<?php

namespace App\Enums;

/**
 * 雇用形態。work_experiences.employment_type / job_postings.employment_type の
 * CHECK制約と対応する(両テーブルで共通の区分)
 */
enum EmploymentType: string
{
    case FullTime = 'full_time';
    case PartTime = 'part_time';
    case Contract = 'contract';
}
