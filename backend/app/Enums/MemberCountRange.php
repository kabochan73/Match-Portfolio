<?php

namespace App\Enums;

/**
 * companies.member_count_range のCHECK制約と対応するメンバー数レンジ
 */
enum MemberCountRange: string
{
    case OneToTen = '1_10';
    case ElevenToFifty = '11_50';
    case FiftyOneToHundred = '51_100';
    case HundredOneToThreeHundred = '101_300';
    case ThreeHundredOnePlus = '301_plus';
}
