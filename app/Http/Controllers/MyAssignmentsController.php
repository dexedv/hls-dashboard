<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\Ticket;
use Inertia\Inertia;

class MyAssignmentsController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $tasks = Task::where('assigned_to', $userId)
            ->whereNull('archived_at')
            ->whereNotIn('status', ['done'])
            ->with(['project:id,name'])
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END")
            ->orderBy('due_date')
            ->get(['id', 'title', 'status', 'priority', 'due_date', 'project_id']);

        $tickets = Ticket::where('assigned_to', $userId)
            ->whereNotIn('status', ['closed', 'resolved'])
            ->with(['customer:id,name'])
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END")
            ->get(['id', 'title', 'status', 'priority', 'customer_id']);

        $projects = Project::whereHas('assignees', fn($q) => $q->where('users.id', $userId))
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->whereNull('archived_at')
            ->with(['customer:id,name'])
            ->orderBy('end_date')
            ->get(['id', 'name', 'status', 'priority', 'progress', 'end_date', 'customer_id']);

        return Inertia::render('MyAssignments/Index', [
            'tasks'    => $tasks,
            'tickets'  => $tickets,
            'projects' => $projects,
        ]);
    }
}
