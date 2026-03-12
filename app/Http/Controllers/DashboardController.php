<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Lead;
use App\Models\Project;
use App\Models\Task;
use App\Helpers\PermissionHelper;
use App\Repositories\SupabaseRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index()
    {
        $useSupabase = filter_var(env('USE_SUPABASE', false), FILTER_VALIDATE_BOOLEAN);

        if ($useSupabase) {
            // Use Supabase
            $stats = [
                'customers' => SupabaseRepository::customers()->count(),
                'projects' => SupabaseRepository::projects()->where('status', 'active')->count(),
                'tasks' => SupabaseRepository::tasks()->whereIn('status', ['todo', 'in_progress'])->count(),
                'leads' => SupabaseRepository::leads()->where('status', 'new')->count(),
            ];

            $recentTasks = SupabaseRepository::tasks()
                ->limit(5)
                ->get()
                ->map(function ($task) {
                    $project = SupabaseRepository::projects()->find($task['project_id'] ?? 0);
                    $task['project_name'] = $project['name'] ?? 'Kein Projekt';
                    return $task;
                });

            $recentLeads = SupabaseRepository::leads()
                ->limit(5)
                ->get();
        } else {
            // Use SQLite/Eloquent
            $stats = [
                'customers' => Customer::count(),
                'projects' => Project::where('status', 'active')->count(),
                'tasks' => Task::whereIn('status', ['todo', 'in_progress'])->count(),
                'leads' => Lead::where('status', 'new')->count(),
            ];

            $recentTasks = Task::with('project')
                ->limit(5)
                ->get()
                ->map(function ($task) {
                    $task['project_name'] = $task->project->name ?? 'Kein Projekt';
                    return $task;
                });

            $recentLeads = Lead::limit(5)->get();
        }

        // Get user permissions
        $user = auth()->user();
        $permissions = $user ? PermissionHelper::getRolePermissions($user->role) : [];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentTasks' => $recentTasks,
            'recentLeads' => $recentLeads,
            'permissions' => $permissions,
        ]);
    }
}
