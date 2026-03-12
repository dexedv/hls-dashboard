<?php

namespace App\Http\Controllers;

use App\Models\TimeEntry;
use App\Models\Project;
use App\Models\Task;
use App\Repositories\SupabaseRepository;
use App\Helpers\SupabaseHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimeEntryController extends Controller
{
    /**
     * Display a listing of time entries.
     */
    public function index(Request $request)
    {
        if (SupabaseHelper::useSupabase()) {
            $timeEntries = SupabaseRepository::timeEntries()->all();

            if ($request->project_id) {
                $timeEntries = $timeEntries->where('project_id', $request->project_id);
            }

            if ($request->date) {
                $timeEntries = $timeEntries->filter(function($te) use ($request) {
                    return isset($te['start_time']) && \Carbon\Carbon::parse($te['start_time'])->toDateString() === $request->date;
                });
            }

            $timeEntries = SupabaseHelper::toPaginated($timeEntries, 10);
            $projects = SupabaseRepository::projects()->all();

            // Calculate totals
            $allEntries = SupabaseRepository::timeEntries()->all();
            $totalDuration = $allEntries->sum('duration');

            return Inertia::render('TimeTracking/Index', [
                'timeEntries' => $timeEntries,
                'projects' => $projects,
                'filters' => $request->only(['project_id', 'date']),
                'totalDuration' => $totalDuration,
            ]);
        }

        $query = TimeEntry::query()->with(['project', 'task', 'user']);

        if ($request->project_id) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->date) {
            $query->whereDate('start_time', $request->date);
        }

        $timeEntries = $query->orderBy('start_time', 'desc')
            ->paginate(10)
            ->withQueryString();

        $projects = Project::all();

        // Calculate totals
        $totalDuration = TimeEntry::sum('duration');

        return Inertia::render('TimeTracking/Index', [
            'timeEntries' => $timeEntries,
            'projects' => $projects,
            'filters' => $request->only(['project_id', 'date']),
            'totalDuration' => $totalDuration,
        ]);
    }

    /**
     * Show the form for creating a new time entry.
     */
    public function create(Request $request)
    {
        if (SupabaseHelper::useSupabase()) {
            $projects = SupabaseRepository::projects()->all();
            $tasks = SupabaseRepository::tasks()->all();
            return Inertia::render('TimeTracking/Create', [
                'projects' => $projects,
                'tasks' => $tasks,
                'project_id' => $request->project_id,
                'task_id' => $request->task_id,
            ]);
        }

        $projects = Project::all();
        $tasks = Task::all();
        return Inertia::render('TimeTracking/Create', [
            'projects' => $projects,
            'tasks' => $tasks,
            'project_id' => $request->project_id,
            'task_id' => $request->task_id,
        ]);
    }

    /**
     * Store a newly created time entry.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after:start_time',
            'duration' => 'nullable|integer|min:0',
            'project_id' => 'nullable',
            'task_id' => 'nullable',
            'billable' => 'boolean',
        ]);

        $validated['user_id'] = auth()->id();

        // Calculate duration if end_time is provided
        if ($validated['end_time'] && !$validated['duration']) {
            $start = \Carbon\Carbon::parse($validated['start_time']);
            $end = \Carbon\Carbon::parse($validated['end_time']);
            $validated['duration'] = $end->diffInMinutes($start);
        }

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::timeEntries()->create($validated);
        } else {
            TimeEntry::create($validated);
        }

        return redirect()->route('time-tracking.index')
            ->with('success', 'Zeiteintrag erfolgreich erstellt.');
    }

    /**
     * Show the form for editing the specified time entry.
     */
    public function edit(TimeEntry $timeEntry)
    {
        if (SupabaseHelper::useSupabase()) {
            $timeEntry = SupabaseRepository::timeEntries()->find($timeEntry->id);
            $projects = SupabaseRepository::projects()->all();
            $tasks = SupabaseRepository::tasks()->all();
            return Inertia::render('TimeTracking/Edit', [
                'timeEntry' => $timeEntry,
                'projects' => $projects,
                'tasks' => $tasks,
            ]);
        }

        $projects = Project::all();
        $tasks = Task::all();

        return Inertia::render('TimeTracking/Edit', [
            'timeEntry' => $timeEntry,
            'projects' => $projects,
            'tasks' => $tasks,
        ]);
    }

    /**
     * Update the specified time entry.
     */
    public function update(Request $request, TimeEntry $timeEntry)
    {
        $validated = $request->validate([
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after:start_time',
            'duration' => 'nullable|integer|min:0',
            'project_id' => 'nullable',
            'task_id' => 'nullable',
            'billable' => 'boolean',
        ]);

        // Recalculate duration if end_time changed
        if ($validated['end_time']) {
            $start = \Carbon\Carbon::parse($validated['start_time']);
            $end = \Carbon\Carbon::parse($validated['end_time']);
            $validated['duration'] = $end->diffInMinutes($start);
        }

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::timeEntries()->update($timeEntry->id, $validated);
        } else {
            $timeEntry->update($validated);
        }

        return redirect()->route('time-tracking.index')
            ->with('success', 'Zeiteintrag erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified time entry.
     */
    public function destroy(TimeEntry $timeEntry)
    {
        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::timeEntries()->delete($timeEntry->id);
        } else {
            $timeEntry->delete();
        }

        return redirect()->route('time-tracking.index')
            ->with('success', 'Zeiteintrag erfolgreich gelöscht.');
    }

    /**
     * Start timer
     */
    public function start(Request $request)
    {
        $validated = [
            'user_id' => auth()->id(),
            'project_id' => $request->project_id,
            'task_id' => $request->task_id,
            'description' => $request->description,
            'start_time' => now(),
            'billable' => $request->billable ?? true,
        ];

        if (SupabaseHelper::useSupabase()) {
            $timeEntry = SupabaseRepository::timeEntries()->create($validated);
        } else {
            $timeEntry = TimeEntry::create($validated);
        }

        return redirect()->back()->with('activeTimer', $timeEntry);
    }

    /**
     * Stop timer
     */
    public function stop(TimeEntry $timeEntry)
    {
        $validated = [
            'end_time' => now(),
            'duration' => now()->diffInMinutes($timeEntry->start_time),
        ];

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::timeEntries()->update($timeEntry->id, $validated);
        } else {
            $timeEntry->update($validated);
        }

        return redirect()->back();
    }
}
