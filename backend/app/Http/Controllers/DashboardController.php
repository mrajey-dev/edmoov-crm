<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Course;
use App\Models\University;
use App\Models\Lead;
use App\Models\RawLead;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $user = $request->user();
        $targetUserId = null;
        if ($user) {
            if (!$user->isSuperAdmin()) {
                $targetUserId = $user->id;
            } elseif ($request->filled('user_id')) {
                $targetUserId = $request->user_id;
            }
        }

        $applyUserScope = function ($query) use ($targetUserId) {
            if ($targetUserId) {
                $query->where('user_id', $targetUserId);
            }
            return $query;
        };

        $totalStudents = $applyUserScope(Student::query())->count();
        $totalCourses = Course::count();
        $totalUniversities = University::count();
        $totalLeads = $applyUserScope(Lead::query())->count();
        $totalRawLeads = $applyUserScope(RawLead::query())->count();

        $activeApplications = $applyUserScope(Student::whereIn('status', ['Pending', 'Active']))->count();

        $successRate = 94;

        $calculateGrowth = function ($modelClass, $condition = null) use ($targetUserId) {
            $now = Carbon::now();
            $currentMonthStart = $now->copy()->startOfMonth();
            $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
            $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

            $queryCurrent = $modelClass::where('created_at', '>=', $currentMonthStart);
            $queryLast = $modelClass::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd]);

            if ($targetUserId && in_array($modelClass, [Student::class, Lead::class, RawLead::class])) {
                $queryCurrent->where('user_id', $targetUserId);
                $queryLast->where('user_id', $targetUserId);
            }

            if ($condition) {
                $condition($queryCurrent);
                $condition($queryLast);
            }

            $current = $queryCurrent->count();
            $last = $queryLast->count();

            if ($last == 0) return $current > 0 ? 100 : 0;
            return round((($current - $last) / $last) * 100);
        };

        $growth = [
            'students' => $calculateGrowth(Student::class),
            'applications' => $calculateGrowth(Student::class, function ($q) { $q->whereIn('status', ['Pending', 'Active']); }),
            'courses' => $calculateGrowth(Course::class),
            'leads' => $calculateGrowth(Lead::class),
            'raw_leads' => $calculateGrowth(RawLead::class),
        ];

        // 1. Lead Trend Data (Monthly over last 6 months)
        $sixMonthsAgo = Carbon::now()->subMonths(5)->startOfMonth();
        $monthlyLeadsQuery = Lead::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('count(*) as count')
        )->where('created_at', '>=', $sixMonthsAgo);

        if ($targetUserId) {
            $monthlyLeadsQuery->where('user_id', $targetUserId);
        }

        $monthlyLeads = $monthlyLeadsQuery
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $leadTrendData = [];
        for ($i = 0; $i < 6; $i++) {
            $date = Carbon::now()->subMonths(5 - $i);
            $monthNum = $date->format('n');
            $leadTrendData[] = [
                'name' => $date->format('M'),
                'leads' => (int) ($monthlyLeads->get($monthNum)->count ?? 0)
            ];
        }

        // 3. Spark Data
        $generateSpark = function ($total) {
            $base = max(1, (int) ($total / 7));
            return [
                ['v' => $base + rand(-$base, $base)],
                ['v' => $base + rand(-$base, $base)],
                ['v' => $base + rand(-$base, $base)],
                ['v' => $base + rand(-$base, $base)],
                ['v' => $base + rand(-$base, $base)],
                ['v' => (int) ($base * 1.5 + rand(0, $base))],
                ['v' => $base * 2 + rand(0, $base)]
            ];
        };

        // 4. Recent Leads
        $recentLeadsQuery = Lead::with('user:id,name,username')->orderBy('created_at', 'desc');
        if ($targetUserId) {
            $recentLeadsQuery->where('user_id', $targetUserId);
        }
        $recentLeads = $recentLeadsQuery->take(6)->get(['id', 'user_id', 'name', 'type', 'created_at']);

        // 5. Revenue Model
        $studentsWithCourses = $applyUserScope(Student::query())->get();
        $leadsQuery = Lead::query();
        if ($targetUserId) {
            $leadsQuery->where('user_id', $targetUserId);
        }
        $allLeadsByEmail = $leadsQuery->get()->keyBy('email');
        $allCoursesByName = Course::all()->keyBy('name');

        $totalRevenue = 0;
        $revenueByLeadTypeData = [
            'hot' => 0,
            'warm' => 0,
            'cold' => 0,
            'approved' => 0,
            'dead' => 0,
        ];

        foreach ($studentsWithCourses as $student) {
            $lead = $allLeadsByEmail->get($student->email);
            if (!$lead) continue;

            $courseName = $student->preferred_course ?: $student->program;
            $course = $allCoursesByName->get($courseName);

            if (!$course && $courseName) {
                $course = $allCoursesByName->first(function ($c) use ($courseName) {
                    return stripos($courseName, $c->name) !== false || stripos($c->name, $courseName) !== false;
                });
            }

            if (!$course) continue;

            $feeStr = preg_replace('/[^0-9]/', '', $course->fee);
            $feeAmount = (int) $feeStr;

            $type = strtolower($lead->type);
            if (isset($revenueByLeadTypeData[$type])) {
                $revenueByLeadTypeData[$type] += $feeAmount;
            }

            if (strtolower($type) === 'approved') {
                $totalRevenue += $feeAmount;
            }
        }

        $revenueByLeadType = [];
        $colors = ['hot' => '#ff4500', 'warm' => '#facc15', 'cold' => '#3b82f6', 'dead' => '#64748b', 'approved' => '#10b981'];
        foreach ($revenueByLeadTypeData as $type => $revenue) {
            $revenueByLeadType[] = [
                'name' => ucfirst($type),
                'revenue' => $revenue,
                'fill' => $colors[$type] ?? '#94a3b8'
            ];
        }

        // 2. Lead Distribution (Pie Chart)
        $leadCountsQuery = Lead::select('type', DB::raw('count(*) as count'));
        if ($targetUserId) {
            $leadCountsQuery->where('user_id', $targetUserId);
        }
        $leadCounts = $leadCountsQuery->groupBy('type')->get();

        $leadDistribution = $leadCounts->map(function ($l) use ($colors, $revenueByLeadTypeData) {
            return [
                'name' => ucfirst($l->type) . ' Leads',
                'value' => $l->count,
                'revenue' => $revenueByLeadTypeData[strtolower($l->type)] ?? 0,
                'color' => $colors[$l->type] ?? '#94a3b8'
            ];
        });

        // 6. Top Universities
        $topUniversitiesQuery = Student::whereNotNull('preferred_college')
            ->select('preferred_college as name', DB::raw('count(*) as count'));
        if ($targetUserId) {
            $topUniversitiesQuery->where('user_id', $targetUserId);
        }
        $topUniversities = $topUniversitiesQuery
            ->groupBy('preferred_college')
            ->orderByDesc('count')
            ->take(5)
            ->get();

        $topUniversitiesData = [];
        $allUniversitiesByName = University::all()->keyBy('name');
        foreach ($topUniversities as $tu) {
            $uni = $allUniversitiesByName->get($tu->name);
            if (!$uni) {
                $uni = $allUniversitiesByName->first(function ($u) use ($tu) {
                    return stripos($tu->name, $u->name) !== false || stripos($u->name, $tu->name) !== false;
                });
            }
            $topUniversitiesData[] = [
                'name' => $uni ? $uni->name : $tu->name,
                'country' => $uni->country ?? 'Unknown',
                'count' => $tu->count,
            ];
        }

        // 7. Top Courses
        $topCoursesQuery = Student::whereNotNull('preferred_course')
            ->select('preferred_course as name', DB::raw('count(*) as count'));
        if ($targetUserId) {
            $topCoursesQuery->where('user_id', $targetUserId);
        }
        $topCourses = $topCoursesQuery
            ->groupBy('preferred_course')
            ->orderByDesc('count')
            ->take(5)
            ->get();

        $topCoursesData = [];
        foreach ($topCourses as $tc) {
            $course = $allCoursesByName->get($tc->name);
            if (!$course) {
                $course = $allCoursesByName->first(function ($c) use ($tc) {
                    return stripos($tc->name, $c->name) !== false || stripos($c->name, $tc->name) !== false;
                });
            }
            $topCoursesData[] = [
                'name' => $course ? $course->name : $tc->name,
                'university' => $course->university ?? 'Unknown',
                'fee' => $course->fee ?? '0',
                'count' => $tc->count,
            ];
        }

        return response()->json([
            'total_students' => $totalStudents,
            'active_applications' => $activeApplications,
            'partner_universities' => $totalUniversities,
            'courses_offered' => $totalCourses,
            'total_leads' => $totalLeads,
            'total_raw_leads' => $totalRawLeads,
            'success_rate' => $successRate,
            'lead_trend_data' => $leadTrendData,
            'recent_leads' => $recentLeads,
            'lead_distribution' => $leadDistribution,
            'total_revenue' => $totalRevenue,
            'revenue_by_lead_type' => $revenueByLeadType,
            'spark_data' => [
                'universities' => $generateSpark($totalUniversities),
                'applications' => $generateSpark($activeApplications),
                'students' => $generateSpark($totalStudents),
                'leads' => $generateSpark($totalLeads),
                'raw_leads' => $generateSpark($totalRawLeads),
            ],
            'growth' => $growth,
            'top_universities' => $topUniversitiesData,
            'top_courses' => $topCoursesData
        ]);
    }

    public function getEnrollments(Request $request)
    {
        $user = $request->user();
        $targetUserId = null;
        if ($user) {
            if (!$user->isSuperAdmin()) {
                $targetUserId = $user->id;
            } elseif ($request->filled('user_id')) {
                $targetUserId = $request->user_id;
            }
        }

        $period = $request->query('period', '1m');
        $now = Carbon::now();

        switch ($period) {
            case '1y':
                $startDate = $now->copy()->startOfMonth()->subMonths(11);
                $prevStartDate = $startDate->copy()->subMonths(12);
                break;
            case '6m':
                $startDate = $now->copy()->startOfMonth()->subMonths(5);
                $prevStartDate = $startDate->copy()->subMonths(6);
                break;
            case '3m':
                $startDate = $now->copy()->startOfMonth()->subMonths(2);
                $prevStartDate = $startDate->copy()->subMonths(3);
                break;
            case '1m':
            default:
                $startDate = $now->copy()->subDays(29)->startOfDay();
                $prevStartDate = $startDate->copy()->subDays(30);
                break;
        }

        $studentsQuery = Student::query();
        if ($targetUserId) {
            $studentsQuery->where('user_id', $targetUserId);
        }
        $students = $studentsQuery->get();

        $currentEnrollments = 0;
        $previousEnrollments = 0;
        $currentBuckets = [];
        $previousBuckets = [];

        if ($period === '1m') {
            for ($i = 0; $i <= 29; $i++) {
                $d = $startDate->copy()->addDays($i)->format('d M');
                $currentBuckets[$d] = 0;
                $pd = $prevStartDate->copy()->addDays($i)->format('d M');
                $previousBuckets[$pd] = 0;
            }
        } else {
            $monthsCount = $period === '1y' ? 12 : ($period === '6m' ? 6 : 3);
            for ($i = 0; $i < $monthsCount; $i++) {
                $m = $startDate->copy()->addMonths($i)->format('M Y');
                $currentBuckets[$m] = 0;
                $pm = $prevStartDate->copy()->addMonths($i)->format('M Y');
                $previousBuckets[$pm] = 0;
            }
        }

        foreach ($students as $student) {
            $val = 1;
            $createdAt = Carbon::parse($student->created_at);

            if ($createdAt >= $startDate && $createdAt <= $now) {
                $currentEnrollments += $val;
                if ($period === '1m') {
                    $key = $createdAt->format('d M');
                    if (isset($currentBuckets[$key])) $currentBuckets[$key] += $val;
                } else {
                    $key = $createdAt->format('M Y');
                    if (isset($currentBuckets[$key])) $currentBuckets[$key] += $val;
                }
            }

            if ($createdAt >= $prevStartDate && $createdAt < $startDate) {
                $previousEnrollments += $val;
                if ($period === '1m') {
                    $diffDays = $createdAt->diffInDays($prevStartDate);
                    $key = $prevStartDate->copy()->addDays($diffDays)->format('d M');
                    if (isset($previousBuckets[$key])) $previousBuckets[$key] += $val;
                } else {
                    $key = $createdAt->format('M Y');
                    if (isset($previousBuckets[$key])) $previousBuckets[$key] += $val;
                }
            }
        }

        $growth = 0;
        if ($previousEnrollments > 0) {
            $growth = round((($currentEnrollments - $previousEnrollments) / $previousEnrollments) * 100, 1);
        } else if ($currentEnrollments > 0) {
            $growth = 100;
        }

        $chartData = [];
        $currentKeys = array_keys($currentBuckets);
        $previousKeys = array_keys($previousBuckets);

        for ($i = 0; $i < count($currentKeys); $i++) {
            $chartData[] = [
                'name' => $period === '1m' ? $currentKeys[$i] : explode(' ', $currentKeys[$i])[0],
                'enrollments' => $currentBuckets[$currentKeys[$i]],
                'previous_enrollments' => isset($previousKeys[$i]) ? $previousBuckets[$previousKeys[$i]] : 0
            ];
        }

        return response()->json([
            'current_enrollments' => $currentEnrollments,
            'previous_enrollments' => $previousEnrollments,
            'growth' => $growth,
            'period' => $period,
            'chart_data' => $chartData
        ]);
    }
}
