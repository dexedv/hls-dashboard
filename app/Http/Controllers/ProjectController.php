<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Customer;
use App\Helpers\StatusHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects.
     */
    public function index(Request $request)
    {
        $query = Project::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $projects = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $customers = Customer::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'customers' => $customers,
            'filters' => $request->only(['search', 'status']),
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
        return Inertia::render('Projects/Create', [
            'customers' => $customers,
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
        ]);

        $validated['created_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'planning';
        $validated['priority'] = $validated['priority'] ?? 'medium';

        Project::create($validated);

        return redirect()->route('projects.index')
            ->with('success', 'Projekt erfolgreich erstellt.');
    }

    /**
     * Display the specified project.
     */
    public function show($id)
    {
        $project = Project::with(['customer', 'tasks', 'timeEntries', 'creator'])->findOrFail($id);
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
        $project = Project::findOrFail($id);
        $customers = Customer::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Projects/Edit', [
            'project' => $project,
            'customers' => $customers,
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
            'budget' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'customer_id' => 'nullable',
        ]);

        $project = Project::findOrFail($id);
        $project->update($validated);

        return redirect()->route('projects.index')
            ->with('success', 'Projekt erfolgreich aktualisiert.');
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
