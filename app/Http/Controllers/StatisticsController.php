<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Lead;
use App\Models\Project;
use App\Models\Task;
use App\Models\Ticket;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StatisticsController extends Controller
{
    public function index()
    {
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

        // Monthly revenue for last 12 months
        $monthlyRevenue = Invoice::where('status', 'paid')
            ->where('created_at', '>=', now()->subMonths(12))
            ->selectRaw("to_char(created_at, 'YYYY-MM') as month, sum(total) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->toArray();

        // Fill in missing months
        $revenueData = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i)->format('Y-m');
            $label = now()->subMonths($i)->format('M Y');
            $revenueData[] = [
                'month' => $label,
                'total' => (float) ($monthlyRevenue[$month] ?? 0),
            ];
        }

        return Inertia::render('Statistics/Index', [
            'stats' => $stats,
            'projectsByStatus' => $projectsByStatus,
            'tasksByStatus' => $tasksByStatus,
            'leadsByStatus' => $leadsByStatus,
            'monthlyRevenue' => $revenueData,
        ]);
    }
}
