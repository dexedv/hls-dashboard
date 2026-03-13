<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use App\Repositories\SupabaseRepository;
use App\Helpers\SupabaseHelper;
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
        if (SupabaseHelper::useSupabase()) {
            $tasks = SupabaseRepository::tasks()->all();

            if ($request->search) {
                $search = strtolower($request->search);
                $tasks = $tasks->filter(function($t) use ($search) {
                    return str_contains(strtolower($t['title'] ?? ''), $search) ||
                           str_contains(strtolower($t['description'] ?? ''), $search);
                });
            }

            if ($request->status) {
                $tasks = $tasks->where('status', $request->status);
            }

            if ($request->project_id) {
                $tasks = $tasks->where('project_id', $request->project_id);
            }

            $tasks = SupabaseHelper::toPaginated($tasks, 10);
            $projects = SupabaseRepository::projects()->all();

            return Inertia::render('Tasks/Index', [
                'tasks' => $tasks,
                'filters' => $request->only(['search', 'status', 'project_id']),
                'projects' => $projects,
                'statuses' => StatusHelper::taskStatuses(),
                'priorities' => StatusHelper::priorities(),
            ]);
        }

        $query = Task::query()->with(['project', 'assignee']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
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

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'filters' => $request->only(['search', 'status', 'project_id']),
            'projects' => $projects,
            'statuses' => StatusHelper::taskStatuses(),
            'priorities' => StatusHelper::priorities(),
        ]);
    }

    /**
     * Show the form for creating a new task.
     */
    public function create(Request $request)
    {
        if (SupabaseHelper::useSupabase()) {
            $projects = SupabaseRepository::projects()->all();
            $users = SupabaseRepository::users()->all();
            return Inertia::render('Tasks/Create', [
                'projects' => $projects,
                'users' => $users,
                'project_id' => $request->project_id,
            ]);
        }

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

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::tasks()->create($validated);
        } else {
            Task::create($validated);
        }

        return redirect()->route('tasks.index')
            ->with('success', 'Aufgabe erfolgreich erstellt.');
    }

    /**
     * Display the specified task.
     */
    public function show(Task $task)
    {
        if (SupabaseHelper::useSupabase()) {
            $task = SupabaseRepository::tasks()->find($task->id);
            return Inertia::render('Tasks/Show', [
                'task' => $task,
            ]);
        }

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
        if (SupabaseHelper::useSupabase()) {
            $task = SupabaseRepository::tasks()->find($task->id);
            $projects = SupabaseRepository::projects()->all();
            $users = SupabaseRepository::users()->all();
            return Inertia::render('Tasks/Edit', [
                'task' => $task,
                'projects' => $projects,
                'users' => $users,
            ]);
        }

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

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::tasks()->update($task->id, $validated);
        } else {
            $task->update($validated);
        }

        return redirect()->route('tasks.index')
            ->with('success', 'Aufgabe erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified task.
     */
    public function destroy(Task $task)
    {
        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::tasks()->delete($task->id);
        } else {
            $task->delete();
        }

        return redirect()->route('tasks.index')
            ->with('success', 'Aufgabe erfolgreich gelöscht.');
    }
}
