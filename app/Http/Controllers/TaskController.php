<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use App\Helpers\StatusHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Display a listing of tasks.
     */
    public function index(Request $request)
    {
        $query = Task::query()->with(['project', 'assignee']);

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

        $tasks = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $projects = Project::all();

        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'filters' => $request->only(['search', 'status', 'project_id']),
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
        $projects = Project::all();
        $users = User::all();
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
            'project_id' => 'nullable',
            'assigned_to' => 'nullable',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'todo';
        $validated['priority'] = $validated['priority'] ?? 'medium';

        Task::create($validated);

        return redirect()->route('tasks.index')
            ->with('success', 'Aufgabe erfolgreich erstellt.');
    }

    /**
     * Display the specified task.
     */
    public function show(Task $task)
    {
        $task->load(['project', 'assignee', 'creator', 'timeEntries']);

        return Inertia::render('Tasks/Show', [
            'task' => $task,
        ]);
    }

    /**
     * Show the form for editing the specified task.
     */
    public function edit(Task $task)
    {
        $projects = Project::all();
        $users = User::all();
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
            'project_id' => 'nullable',
            'assigned_to' => 'nullable',
        ]);

        $task->update($validated);

        return redirect()->route('tasks.index')
            ->with('success', 'Aufgabe erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified task.
     */
    public function destroy(Task $task)
    {
        $task->delete();

        return redirect()->route('tasks.index')
            ->with('success', 'Aufgabe erfolgreich gelöscht.');
    }
}
