<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Lead;
use App\Models\Project;
use App\Models\Task;
use App\Helpers\PermissionHelper;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'customers' => Customer::count(),
            'projects' => Project::where('status', 'active')->count(),
            'tasks' => Task::whereIn('status', ['todo', 'in_progress'])->count(),
            'leads' => Lead::where('status', 'new')->count(),
        ];

        $recentTasks = Task::with('project')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($task) {
                $task['project_name'] = $task->project->name ?? 'Kein Projekt';
                return $task;
            });

        $recentLeads = Lead::latest()->limit(5)->get();

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
