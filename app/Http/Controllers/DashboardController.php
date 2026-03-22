<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Lead;
use App\Models\Project;
use App\Models\Task;
use App\Models\AuditLog;
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

        $activityFeed = AuditLog::with('user')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user_name' => $log->user?->name ?? 'System',
                    'action' => $log->action,
                    'description' => $log->description,
                    'model_type' => class_basename($log->model_type ?? ''),
                    'model_id' => $log->model_id,
                    'created_at' => $log->created_at?->toISOString(),
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentTasks' => $recentTasks,
            'recentLeads' => $recentLeads,
            'permissions' => $permissions,
            'activityFeed' => $activityFeed,
        ]);
    }
}
