<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Customer;
use App\Models\User;
use App\Helpers\StatusHelper;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects.
     */
    public function index(Request $request)
    {
        $showArchived = $request->boolean('show_archived');
        $query = Project::query();

        if ($showArchived) {
            $query->whereNotNull('archived_at');
        } else {
            $query->whereNull('archived_at');
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $sort = $request->sort ?? 'end_date';
        match ($sort) {
            'status_progress' => $query->orderByRaw("CASE status WHEN 'active' THEN 1 WHEN 'planning' THEN 2 WHEN 'on_hold' THEN 3 WHEN 'completed' THEN 4 WHEN 'cancelled' THEN 5 ELSE 6 END ASC")->orderBy('progress', 'desc'),
            'status'          => $query->orderByRaw("CASE status WHEN 'active' THEN 1 WHEN 'planning' THEN 2 WHEN 'on_hold' THEN 3 WHEN 'completed' THEN 4 WHEN 'cancelled' THEN 5 ELSE 6 END ASC"),
            'priority'        => $query->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 ELSE 5 END ASC"),
            'end_date'        => $query->orderByRaw('end_date ASC NULLS LAST'),
            'created_asc'     => $query->orderBy('created_at', 'asc'),
            default           => $query->orderBy('created_at', 'desc'),
        };

        $projects = $query->with(['customer', 'assignees'])
            ->withCount('folders')
            ->paginate(10)
            ->withQueryString();

        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'customers' => $customers,
            'users' => $users,
            'filters' => (object) $request->only(['search', 'status', 'sort', 'show_archived']),
            'statuses' => StatusHelper::projectStatuses(),
            'priorities' => StatusHelper::priorities(),
        ]);
    }

    /**
     * Show the form for creating a new project.
     */
    public function create(Request $request)
    {
        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Projects/Create', [
            'customers' => $customers,
            'users' => $users,
            'customer_id' => $request->customer_id,
        ]);
    }

    /**
     * Store a newly created project.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:planning,active,completed,on_hold,cancelled',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'budget' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'customer_id' => 'nullable',
            'assigned_users' => 'nullable|array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'planning';
        $validated['priority'] = $validated['priority'] ?? 'medium';

        $assignedUsers = $validated['assigned_users'] ?? [];
        unset($validated['assigned_users']);

        $project = Project::create($validated);
        $project->assignees()->sync($assignedUsers);

        if (in_array($project->status, ['completed', 'cancelled'])) {
            $project->update(['archived_at' => now()]);
        }

        NotificationService::notifyAssigned(
            array_map('intval', $assignedUsers),
            'Neues Projekt: ' . $project->name,
            'Du wurdest einem Projekt zugewiesen.',
            route('projects.show', $project->id),
            auth()->id()
        );

        return redirect()->route('projects.index')
            ->with('success', 'Projekt erfolgreich erstellt.');
    }

    /**
     * Display the specified project.
     */
    public function show($id)
    {
        $project = Project::with(['customer', 'tasks', 'timeEntries', 'creator', 'assignees', 'folders.attachments'])->findOrFail($id);
        return Inertia::render('Projects/Show', [
            'project' => $project,
            'statuses' => StatusHelper::projectStatuses(),
            'priorities' => StatusHelper::priorities(),
        ]);
    }

    /**
     * Show the form for editing the specified project.
     */
    public function edit($id)
    {
        $project = Project::with('assignees')->findOrFail($id);
        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Projects/Edit', [
            'project' => $project,
            'customers' => $customers,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:planning,active,completed,on_hold,cancelled',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'progress' => 'nullable|integer|min:0|max:100',
            'budget' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'customer_id' => 'nullable',
            'assigned_users' => 'nullable|array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        $assignedUsers = $validated['assigned_users'] ?? [];
        unset($validated['assigned_users']);

        $project = Project::with('assignees')->findOrFail($id);
        $existingUserIds = $project->assignees->pluck('id')->map(fn($id) => (int)$id)->toArray();
        $project->update($validated);
        $project->assignees()->sync($assignedUsers);

        if (in_array($project->status, ['completed', 'cancelled']) && !$project->archived_at) {
            $project->update(['archived_at' => now()]);
        } elseif (!in_array($project->status, ['completed', 'cancelled']) && $project->archived_at) {
            $project->update(['archived_at' => null]);
        }

        NotificationService::notifyNewlyAssigned(
            array_map('intval', $assignedUsers), $existingUserIds,
            'Projekt: ' . $project->name,
            'Du wurdest einem Projekt zugewiesen.',
            route('projects.show', $project->id),
            auth()->id()
        );

        return redirect()->route('projects.index')
            ->with('success', 'Projekt erfolgreich aktualisiert.');
    }

    /**
     * Update only the status of the specified project.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:planning,active,completed,on_hold,cancelled']);
        $project = Project::findOrFail($id);
        $project->update(['status' => $request->status]);

        if (in_array($request->status, ['completed', 'cancelled']) && !$project->archived_at) {
            $project->update(['archived_at' => now()]);
        } elseif (!in_array($request->status, ['completed', 'cancelled']) && $project->archived_at) {
            $project->update(['archived_at' => null]);
        }

        return redirect()->back()->with('success', 'Status aktualisiert.');
    }

    /**
     * Archive the specified project.
     */
    public function archive($id)
    {
        $project = Project::findOrFail($id);
        $project->update(['archived_at' => now()]);

        return redirect()->back()->with('success', 'Projekt archiviert.');
    }

    /**
     * Restore an archived project.
     */
    public function restore($id)
    {
        $project = Project::findOrFail($id);
        $project->update(['archived_at' => null]);

        return redirect()->back()->with('success', 'Projekt wiederhergestellt.');
    }

    /**
     * Bulk archive projects.
     */
    public function bulkArchive(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:projects,id',
        ]);

        Project::whereIn('id', $request->ids)->update(['archived_at' => now()]);

        return redirect()->back()->with('success', count($request->ids) . ' Projekte archiviert.');
    }

    /**
     * Remove the specified project.
     */
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Projekt erfolgreich gelöscht.');
    }
}
