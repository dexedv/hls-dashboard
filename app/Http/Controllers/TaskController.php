<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use App\Helpers\StatusHelper;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Display a listing of tasks.
     */
    public function index(Request $request)
    {
        $showArchived = $request->boolean('show_archived');
        $query = Task::query()->with(['project', 'assignees']);

        if ($showArchived) {
            $query->whereNotNull('archived_at');
        } else {
            $query->whereNull('archived_at');
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'ilike', "%{$request->search}%")
                    ->orWhere('description', 'ilike', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->project_id) {
            $query->where('project_id', $request->project_id);
        }

        $sort = $request->sort ?? 'due_date';
        match ($sort) {
            'status'       => $query->orderByRaw("CASE status WHEN 'todo' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'review' THEN 3 WHEN 'done' THEN 4 ELSE 5 END ASC"),
            'priority'     => $query->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 ELSE 5 END ASC"),
            'due_date'     => $query->orderByRaw('due_date ASC NULLS LAST'),
            'created_asc'  => $query->orderBy('created_at', 'asc'),
            default        => $query->orderBy('created_at', 'desc'),
        };

        $tasks = $query->withCount('folders')->paginate(10)->withQueryString();

        $projects = Project::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'filters' => (object) $request->only(['search', 'status', 'project_id', 'sort', 'show_archived']),
            'projects' => $projects,
            'users' => $users,
            'statuses' => StatusHelper::taskStatuses(),
            'priorities' => StatusHelper::priorities(),
        ]);
    }

    /**
     * Show the form for creating a new task.
     */
    public function create(Request $request)
    {
        $projects = Project::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Tasks/Create', [
            'projects' => $projects,
            'users' => $users,
            'project_id' => $request->project_id,
        ]);
    }

    /**
     * Store a newly created task.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:todo,in_progress,review,done',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'project_id' => 'nullable',
            'assigned_users' => 'nullable|array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'todo';
        $validated['priority'] = $validated['priority'] ?? 'medium';

        $assignedUsers = $validated['assigned_users'] ?? [];
        unset($validated['assigned_users']);

        $task = Task::create($validated);
        $task->assignees()->sync($assignedUsers);

        if ($task->status === 'done') {
            $task->update(['archived_at' => now()]);
        }

        if ($task->project_id) {
            $task->project->recalculateProgress();
        }

        NotificationService::notifyAssigned(
            array_map('intval', $assignedUsers),
            'Neue Aufgabe: ' . $task->title,
            'Du wurdest einer Aufgabe zugewiesen.',
            route('tasks.show', $task->id),
            auth()->id()
        );

        return redirect()->route('tasks.index')
            ->with('success', 'Aufgabe erfolgreich erstellt.');
    }

    /**
     * Display the specified task.
     */
    public function show(Task $task)
    {
        $task->load(['project', 'assignees', 'creator', 'timeEntries', 'folders.attachments']);

        return Inertia::render('Tasks/Show', [
            'task' => $task,
        ]);
    }

    /**
     * Show the form for editing the specified task.
     */
    public function edit(Task $task)
    {
        $task->load('assignees');
        $projects = Project::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Tasks/Edit', [
            'task' => $task,
            'projects' => $projects,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified task.
     */
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:todo,in_progress,review,done',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'project_id' => 'nullable',
            'assigned_users' => 'nullable|array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        $assignedUsers   = array_map('intval', $validated['assigned_users'] ?? []);
        $existingUserIds = $task->assignees->pluck('id')->map(fn($id) => (int)$id)->toArray();
        unset($validated['assigned_users']);

        $oldProjectId = $task->project_id;
        $task->update($validated);
        $task->assignees()->sync($assignedUsers);

        if ($task->status === 'done' && !$task->archived_at) {
            $task->update(['archived_at' => now()]);
        } elseif ($task->status !== 'done' && $task->archived_at) {
            $task->update(['archived_at' => null]);
        }

        if ($task->project_id) {
            $task->project->recalculateProgress();
        }
        // If the task was moved from another project, recalculate that one too
        if ($oldProjectId && $oldProjectId !== $task->project_id) {
            Project::find($oldProjectId)?->recalculateProgress();
        }

        NotificationService::notifyNewlyAssigned(
            $assignedUsers, $existingUserIds,
            'Aufgabe: ' . $task->title,
            'Du wurdest einer Aufgabe zugewiesen.',
            route('tasks.show', $task->id),
            auth()->id()
        );

        return redirect()->route('tasks.show', $task->id)
            ->with('success', 'Aufgabe erfolgreich aktualisiert.');
    }

    /**
     * Update only the status of a task.
     */
    public function updateStatus(Request $request, Task $task)
    {
        $request->validate([
            'status' => 'required|in:todo,in_progress,review,done',
        ]);

        $task->update(['status' => $request->status]);

        if ($request->status === 'done' && !$task->archived_at) {
            $task->update(['archived_at' => now()]);
        } elseif ($request->status !== 'done' && $task->archived_at) {
            $task->update(['archived_at' => null]);
        }

        if ($task->project_id) {
            $task->project->recalculateProgress();
        }

        return redirect()->back()->with('success', 'Status aktualisiert.');
    }

    /**
     * Bulk delete tasks.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tasks,id',
        ]);

        $projectIds = Task::whereIn('id', $request->ids)->whereNotNull('project_id')->pluck('project_id')->unique();

        Task::whereIn('id', $request->ids)->delete();

        Project::whereIn('id', $projectIds)->each(fn($p) => $p->recalculateProgress());

        return redirect()->back()->with('success', count($request->ids) . ' Aufgaben gelöscht.');
    }

    /**
     * Bulk update task status.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tasks,id',
            'status' => 'required|in:todo,in_progress,review,done',
        ]);

        $projectIds = Task::whereIn('id', $request->ids)->whereNotNull('project_id')->pluck('project_id')->unique();

        Task::whereIn('id', $request->ids)->update(['status' => $request->status]);

        if ($request->status === 'done') {
            Task::whereIn('id', $request->ids)->whereNull('archived_at')->update(['archived_at' => now()]);
        } else {
            Task::whereIn('id', $request->ids)->whereNotNull('archived_at')->update(['archived_at' => null]);
        }

        Project::whereIn('id', $projectIds)->each(fn($p) => $p->recalculateProgress());

        return redirect()->back()->with('success', count($request->ids) . ' Aufgaben aktualisiert.');
    }

    /**
     * Archive the specified task.
     */
    public function archive(Task $task)
    {
        $task->update(['archived_at' => now()]);

        return redirect()->back()->with('success', 'Aufgabe archiviert.');
    }

    /**
     * Restore an archived task.
     */
    public function restore(Task $task)
    {
        $task->update(['archived_at' => null]);

        return redirect()->back()->with('success', 'Aufgabe wiederhergestellt.');
    }

    /**
     * Bulk archive tasks.
     */
    public function bulkArchive(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tasks,id',
        ]);

        Task::whereIn('id', $request->ids)->update(['archived_at' => now()]);

        return redirect()->back()->with('success', count($request->ids) . ' Aufgaben archiviert.');
    }

    /**
     * Remove the specified task.
     */
    public function destroy(Task $task)
    {
        $projectId = $task->project_id;
        $task->delete();

        if ($projectId) {
            Project::find($projectId)?->recalculateProgress();
        }

        return redirect()->route('tasks.index')
            ->with('success', 'Aufgabe erfolgreich gelöscht.');
    }
}
