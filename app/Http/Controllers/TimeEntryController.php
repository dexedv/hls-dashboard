<?php

namespace App\Http\Controllers;

use App\Models\TimeEntry;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TimeEntryController extends Controller
{
    /**
     * Display a listing of time entries.
     */
    public function index(Request $request)
    {
        $query = TimeEntry::query()->with(['project', 'task', 'user']);

        if ($request->project_id) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->date) {
            $query->whereDate('start_time', $request->date);
        }

        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        $timeEntries = $query->orderBy('start_time', 'desc')
            ->paginate(25)
            ->withQueryString();

        $projects = Project::orderBy('name')->get(['id', 'name']);
        $users    = User::orderBy('name')->get(['id', 'name']);

        // Overall total
        $totalDuration = TimeEntry::whereNotNull('duration')->sum('duration');

        // Per-employee totals
        $userStats = TimeEntry::select('user_id', DB::raw('SUM(duration) as total_minutes'))
            ->whereNotNull('duration')
            ->groupBy('user_id')
            ->with('user:id,name')
            ->get()
            ->map(fn($e) => [
                'user'          => $e->user ? ['id' => $e->user->id, 'name' => $e->user->name] : ['id' => null, 'name' => 'Unbekannt'],
                'total_minutes' => (int) $e->total_minutes,
            ])
            ->sortByDesc('total_minutes')
            ->values();

        return Inertia::render('TimeTracking/Index', [
            'timeEntries'   => $timeEntries,
            'projects'      => $projects,
            'users'         => $users,
            'filters'       => $request->only(['project_id', 'date', 'user_id']),
            'totalDuration' => (int) $totalDuration,
            'userStats'     => $userStats,
        ]);
    }

    /**
     * Show the form for creating a new time entry.
     */
    public function create(Request $request)
    {
        $projects = Project::orderBy('name')->get(['id', 'name']);
        $tasks = Task::orderBy('title')->get(['id', 'title']);
        $users = User::orderBy('name')->get(['id', 'name']);
        return Inertia::render('TimeTracking/Create', [
            'projects' => $projects,
            'tasks' => $tasks,
            'users' => $users,
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
            'start_time' => 'nullable',
            'end_time' => 'nullable',
            'date' => 'nullable|date',
            'duration' => 'nullable|integer|min:0',
            'project_id' => 'nullable',
            'task_id' => 'nullable',
            'billable' => 'boolean',
            'hourly_rate' => 'nullable|numeric|min:0',
            'user_id' => 'nullable|exists:users,id',
        ]);

        // Combine date + time fields if sent separately
        if (!empty($validated['date']) && !empty($validated['start_time']) && strlen($validated['start_time']) <= 5) {
            $validated['start_time'] = $validated['date'] . ' ' . $validated['start_time'] . ':00';
        }
        if (!empty($validated['date']) && !empty($validated['end_time']) && strlen($validated['end_time']) <= 5) {
            $validated['end_time'] = $validated['date'] . ' ' . $validated['end_time'] . ':00';
        }
        unset($validated['date']);

        $validated['user_id'] = $validated['user_id'] ?? auth()->id();

        // Calculate duration if end_time is provided
        if ($validated['end_time'] && !$validated['duration']) {
            $start = \Carbon\Carbon::parse($validated['start_time']);
            $end = \Carbon\Carbon::parse($validated['end_time']);
            $validated['duration'] = $end->diffInMinutes($start);
        }

        TimeEntry::create($validated);

        return redirect()->route('time-tracking.index')
            ->with('success', 'Zeiteintrag erfolgreich erstellt.');
    }

    /**
     * Show the form for editing the specified time entry.
     */
    public function edit(TimeEntry $time_tracking)
    {
        $time_tracking->load(['project', 'task', 'user']);
        $projects = Project::orderBy('name')->get(['id', 'name']);
        $tasks    = Task::orderBy('title')->get(['id', 'title']);
        $users    = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('TimeTracking/Edit', [
            'timeEntry' => $time_tracking,
            'projects'  => $projects,
            'tasks'     => $tasks,
            'users'     => $users,
        ]);
    }

    /**
     * Update the specified time entry.
     */
    public function update(Request $request, TimeEntry $time_tracking)
    {
        $validated = $request->validate([
            'description' => 'nullable|string',
            'start_time'  => 'required|date',
            'end_time'    => 'nullable|date|after:start_time',
            'duration'    => 'nullable|integer|min:0',
            'project_id'  => 'nullable',
            'task_id'     => 'nullable',
            'user_id'     => 'nullable|exists:users,id',
            'billable'    => 'boolean',
        ]);

        // Recalculate duration if end_time is set
        if (!empty($validated['end_time'])) {
            $start = \Carbon\Carbon::parse($validated['start_time']);
            $end   = \Carbon\Carbon::parse($validated['end_time']);
            $validated['duration'] = (int) $end->diffInMinutes($start);
        }

        $time_tracking->update($validated);

        return redirect()->route('time-tracking.index')
            ->with('success', 'Zeiteintrag erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified time entry.
     */
    public function destroy(TimeEntry $time_tracking)
    {
        $time_tracking->delete();

        return redirect()->route('time-tracking.index')
            ->with('success', 'Zeiteintrag erfolgreich gelöscht.');
    }

    /**
     * Start timer
     */
    public function start(Request $request)
    {
        $timeEntry = TimeEntry::create([
            'user_id' => auth()->id(),
            'project_id' => $request->project_id,
            'task_id' => $request->task_id,
            'description' => $request->description,
            'start_time' => now(),
            'billable' => $request->billable ?? true,
        ]);

        return redirect()->back()->with('activeTimer', $timeEntry);
    }

    /**
     * Stop timer
     */
    public function stop(TimeEntry $timeEntry)
    {
        $endTime  = now();
        $duration = $timeEntry->start_time
            ? (int) $endTime->diffInMinutes($timeEntry->start_time)
            : 0;

        $timeEntry->update([
            'end_time' => $endTime,
            'duration' => $duration,
        ]);

        return redirect()->route('time-tracking.index')
            ->with('success', 'Timer gestoppt. Dauer: ' . intdiv($duration, 60) . 'h ' . ($duration % 60) . 'm');
    }
}
