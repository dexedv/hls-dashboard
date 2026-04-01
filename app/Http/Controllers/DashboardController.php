<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Inventory;
use App\Models\Invoice;
use App\Models\Lead;
use App\Models\Project;
use App\Models\Task;
use App\Models\Ticket;
use App\Models\AuditLog;
use App\Models\Event;
use App\Helpers\PermissionHelper;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        $customersNow = Customer::count();
        $customersLastMonth = Customer::where('created_at', '<', $startOfMonth)->count();
        $customersDiff = $customersNow - $customersLastMonth;

        $projectsNow = Project::where('status', 'active')->count();
        $projectsLastMonth = Project::where('status', 'active')
            ->where('created_at', '<', $startOfMonth)->count();
        $projectsDiff = $projectsNow - $projectsLastMonth;

        $tasksNow = Task::whereIn('status', ['todo', 'in_progress'])->count();
        $tasksLastMonth = Task::whereIn('status', ['todo', 'in_progress', 'done'])
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $tasksDiff = $tasksNow - $tasksLastMonth;

        $leadsNow = Lead::where('status', 'new')->count();
        $leadsThisMonth = Lead::where('status', 'new')
            ->where('created_at', '>=', $startOfMonth)->count();
        $leadsLastMonth = Lead::where('status', 'new')
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $leadsDiff = $leadsThisMonth - $leadsLastMonth;

        $ticketsNow = Ticket::whereIn('status', ['open', 'in_progress', 'pending'])->count();
        $ticketsLastMonth = Ticket::whereIn('status', ['open', 'in_progress', 'pending'])
            ->where('created_at', '<', $startOfMonth)->count();
        $ticketsDiff = $ticketsNow - $ticketsLastMonth;

        $revenueThisMonth = Invoice::where('status', 'paid')
            ->whereBetween('paid_at', [$startOfMonth, $now])
            ->sum('total');
        $revenueLastMonth = Invoice::where('status', 'paid')
            ->whereBetween('paid_at', [$startOfLastMonth, $endOfLastMonth])
            ->sum('total');
        $revenueDiff = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100)
            : ($revenueThisMonth > 0 ? 100 : 0);

        $stats = [
            'customers' => $customersNow,
            'customers_change' => ($customersDiff >= 0 ? '+' : '') . $customersDiff,
            'customers_change_type' => $customersDiff >= 0 ? 'increase' : 'decrease',
            'projects' => $projectsNow,
            'projects_change' => ($projectsDiff >= 0 ? '+' : '') . $projectsDiff,
            'projects_change_type' => $projectsDiff >= 0 ? 'increase' : 'decrease',
            'tasks' => $tasksNow,
            'tasks_change' => ($tasksDiff >= 0 ? '+' : '') . $tasksDiff,
            'tasks_change_type' => $tasksDiff > 0 ? 'increase' : 'decrease',
            'leads' => $leadsNow,
            'leads_change' => ($leadsDiff >= 0 ? '+' : '') . $leadsDiff,
            'leads_change_type' => $leadsDiff >= 0 ? 'increase' : 'decrease',
            'tickets' => $ticketsNow,
            'tickets_change' => ($ticketsDiff >= 0 ? '+' : '') . $ticketsDiff,
            'tickets_change_type' => $ticketsDiff > 0 ? 'increase' : 'decrease',
            'monthly_revenue' => $revenueThisMonth,
            'revenue_change' => ($revenueDiff >= 0 ? '+' : '') . $revenueDiff . '%',
            'revenue_change_type' => $revenueDiff >= 0 ? 'increase' : 'decrease',
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

        $myAssignments = [];
        if ($user) {
            $myTasks = Task::whereHas('assignees', fn($q) => $q->where('users.id', $user->id))
                ->whereIn('status', ['todo', 'in_progress', 'review'])
                ->with('project')
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn($t) => [
                    'id' => $t->id,
                    'type' => 'task',
                    'title' => $t->title,
                    'subtitle' => $t->project->name ?? null,
                    'status' => $t->status,
                    'priority' => $t->priority,
                    'due_date' => $t->due_date?->format('Y-m-d'),
                    'url' => route('tasks.show', $t->id),
                ]);

            $myProjects = Project::whereHas('assignees', fn($q) => $q->where('users.id', $user->id))
                ->whereIn('status', ['planning', 'active'])
                ->with('customer')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'type' => 'project',
                    'title' => $p->name,
                    'subtitle' => $p->customer->name ?? null,
                    'status' => $p->status,
                    'priority' => $p->priority,
                    'due_date' => $p->end_date?->format('Y-m-d'),
                    'url' => route('projects.show', $p->id),
                ]);

            $myTickets = Ticket::whereHas('assignees', fn($q) => $q->where('users.id', $user->id))
                ->whereIn('status', ['open', 'in_progress', 'pending'])
                ->with('customer')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn($t) => [
                    'id' => $t->id,
                    'type' => 'ticket',
                    'title' => $t->title,
                    'subtitle' => $t->customer->name ?? null,
                    'status' => $t->status,
                    'priority' => $t->priority,
                    'due_date' => null,
                    'url' => route('tickets.show', $t->id),
                ]);

            $myAssignments = collect($myTasks)
                ->merge($myProjects)
                ->merge($myTickets)
                ->sortByDesc('id')
                ->values()
                ->all();
        }

        $upcomingEvents = Event::with(['project', 'customer', 'assignees'])
            ->where('start', '>=', now())
            ->where('start', '<=', now()->addDays(14))
            ->orderBy('start', 'asc')
            ->limit(8)
            ->get()
            ->map(fn($e) => [
                'id'           => $e->id,
                'title'        => $e->title,
                'event_type'   => $e->event_type,
                'start'        => $e->start?->toISOString(),
                'end'          => $e->end?->toISOString(),
                'all_day'      => $e->all_day,
                'project_name' => $e->project?->name,
                'customer_name'=> $e->customer?->name,
                'tags'         => $e->tags ?? [],
                'assignees'    => $e->assignees->map(fn($a) => ['id' => $a->id, 'name' => $a->name])->values(),
            ]);

        $activityFeed = null;
        if ($user && in_array($user->role, ['admin', 'owner'])) {
            $modelLabels = [
                'Task' => 'Aufgabe', 'Project' => 'Projekt', 'Ticket' => 'Ticket',
                'Customer' => 'Kunde', 'Note' => 'Notiz', 'Invoice' => 'Rechnung',
                'Quote' => 'Angebot', 'Lead' => 'Lead', 'TimeEntry' => 'Zeiteintrag',
                'LeaveRequest' => 'Urlaubsantrag', 'Event' => 'Termin', 'User' => 'Mitarbeiter',
            ];

            $activityFeed = AuditLog::with('user')
                ->latest()
                ->limit(25)
                ->get()
                ->map(function ($log) use ($modelLabels) {
                    $modelType = class_basename($log->model_type ?? '');
                    $modelLabel = $modelLabels[$modelType] ?? $modelType;

                    $changedFields = [];
                    if (str_ends_with($log->action, '.updated') && $log->new_values) {
                        $ignore = ['updated_at', 'created_at'];
                        foreach ($log->new_values as $field => $newVal) {
                            if (in_array($field, $ignore)) continue;
                            $oldVal = $log->old_values[$field] ?? null;
                            if ($oldVal !== $newVal) {
                                $changedFields[] = $field;
                            }
                        }
                    }

                    return [
                        'id'             => $log->id,
                        'user_name'      => $log->user?->name ?? 'System',
                        'user_initial'   => strtoupper(substr($log->user?->name ?? 'S', 0, 1)),
                        'action'         => $log->action,
                        'model_label'    => $modelLabel,
                        'model_id'       => $log->model_id,
                        'description'    => $log->description,
                        'changed_fields' => $changedFields,
                        'created_at'     => $log->created_at?->toISOString(),
                    ];
                });
        }

        $lowStockItems = Inventory::where('current_stock', '<', 10)
            ->orderBy('current_stock', 'asc')
            ->get(['id', 'name', 'sku', 'current_stock', 'min_stock', 'unit']);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentTasks' => $recentTasks,
            'recentLeads' => $recentLeads,
            'permissions' => $permissions,
            'activityFeed' => $activityFeed,
            'myAssignments' => $myAssignments,
            'upcomingEvents' => $upcomingEvents,
            'lowStockItems' => $lowStockItems,
        ]);
    }
}
