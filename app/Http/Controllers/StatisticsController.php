<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Lead;
use App\Models\Project;
use App\Models\Task;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        $year = (int) ($request->year ?? date('Y'));
        $stats = [
            'customers' => Customer::count(),
            'projects' => Project::count(),
            'tasks' => Task::count(),
            'leads' => Lead::count(),
            'invoices' => Invoice::count(),
            'tickets' => Ticket::count(),
            'revenue' => Invoice::where('status', 'paid')->sum('total'),
            'openTasks' => Task::whereIn('status', ['todo', 'in_progress'])->count(),
            'completedTasks' => Task::where('status', 'done')->count(),
            'activeProjects' => Project::where('status', 'active')->count(),
            'wonLeads' => Lead::where('status', 'won')->count(),
            'leadConversionRate' => Lead::count() > 0
                ? round(Lead::where('status', 'won')->count() / Lead::count() * 100, 1)
                : 0,
        ];

        $projectsByStatus = Project::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $tasksByStatus = Task::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $leadsByStatus = Lead::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Monthly revenue for selected year
        $monthlyRevenue = Invoice::where('status', 'paid')
            ->whereYear('created_at', $year)
            ->selectRaw("to_char(created_at, 'YYYY-MM') as month, sum(total) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->toArray();

        // Fill in all 12 months for selected year
        $revenueData = [];
        for ($m = 1; $m <= 12; $m++) {
            $key = sprintf('%d-%02d', $year, $m);
            $label = \Carbon\Carbon::createFromDate($year, $m, 1)->locale('de')->isoFormat('MMM');
            $revenueData[] = [
                'month' => $label,
                'total' => (float) ($monthlyRevenue[$key] ?? 0),
            ];
        }

        $availableYears = Invoice::where('status', 'paid')
            ->selectRaw('EXTRACT(YEAR FROM created_at)::integer as year')
            ->groupBy('year')
            ->orderByDesc('year')
            ->pluck('year')
            ->toArray();

        if (!in_array((int) date('Y'), $availableYears)) {
            array_unshift($availableYears, (int) date('Y'));
        }

        return Inertia::render('Statistics/Index', [
            'stats' => $stats,
            'projectsByStatus' => $projectsByStatus,
            'tasksByStatus' => $tasksByStatus,
            'leadsByStatus' => $leadsByStatus,
            'monthlyRevenue' => $revenueData,
            'selectedYear' => $year,
            'availableYears' => $availableYears,
        ]);
    }
}
