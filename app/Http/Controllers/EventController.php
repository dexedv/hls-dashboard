<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    /**
     * Display a listing of events.
     */
    public function index(Request $request)
    {
        $query = Event::query()->with('project');

        if ($request->month && $request->year) {
            $query->whereMonth('start', $request->month)
                  ->whereYear('start', $request->year);
        }

        $events = $query->orderBy('start', 'asc')->get();
        $projects = Project::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Calendar/Index', [
            'events' => $events,
            'projects' => $projects,
        ]);
    }

    /**
     * Show the form for creating a new event.
     */
    public function create()
    {
        $projects = Project::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Calendar/Create', [
            'projects' => $projects,
        ]);
    }

    /**
     * Store a newly created event.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start' => 'required|date',
            'end' => 'nullable|date|after:start',
            'all_day' => 'boolean',
            'project_id' => 'nullable',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['user_id'] = auth()->id();

        Event::create($validated);

        return redirect()->route('calendar.index')
            ->with('success', 'Termin erfolgreich erstellt.');
    }

    /**
     * Display the specified event.
     */
    public function show(Event $event)
    {
        $event->load('project');
        return Inertia::render('Calendar/Show', [
            'event' => $event,
        ]);
    }

    /**
     * Show the form for editing the specified event.
     */
    public function edit(Event $event)
    {
        $projects = Project::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Calendar/Edit', [
            'event' => $event,
            'projects' => $projects,
        ]);
    }

    /**
     * Update the specified event.
     */
    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start' => 'required|date',
            'end' => 'nullable|date|after:start',
            'all_day' => 'boolean',
            'project_id' => 'nullable',
        ]);

        $event->update($validated);

        return redirect()->route('calendar.index')
            ->with('success', 'Termin erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified event.
     */
    public function destroy(Event $event)
    {
        $event->delete();

        return redirect()->route('calendar.index')
            ->with('success', 'Termin erfolgreich gelöscht.');
    }
}
