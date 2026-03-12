<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Project;
use App\Repositories\SupabaseRepository;
use App\Helpers\SupabaseHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    /**
     * Display a listing of events.
     */
    public function index(Request $request)
    {
        if (SupabaseHelper::useSupabase()) {
            $events = SupabaseRepository::events()->all();

            if ($request->month && $request->year) {
                $events = $events->filter(function($e) use ($request) {
                    $start = isset($e['start']) ? \Carbon\Carbon::parse($e['start']) : null;
                    return $start && $start->month == $request->month && $start->year == $request->year;
                });
            }

            $events = $events->sortBy('start')->values();
            $projects = SupabaseRepository::projects()->all();

            return Inertia::render('Calendar/Index', [
                'events' => $events,
                'projects' => $projects,
            ]);
        }

        $query = Event::query()->with('project');

        if ($request->month && $request->year) {
            $query->whereMonth('start', $request->month)
                  ->whereYear('start', $request->year);
        }

        $events = $query->orderBy('start', 'asc')->get();
        $projects = Project::all();

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
        if (SupabaseHelper::useSupabase()) {
            $projects = SupabaseRepository::projects()->all();
            return Inertia::render('Calendar/Create', [
                'projects' => $projects,
            ]);
        }

        $projects = Project::all();
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

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::events()->create($validated);
        } else {
            Event::create($validated);
        }

        return redirect()->route('calendar.index')
            ->with('success', 'Termin erfolgreich erstellt.');
    }

    /**
     * Show the form for editing the specified event.
     */
    public function edit(Event $event)
    {
        if (SupabaseHelper::useSupabase()) {
            $event = SupabaseRepository::events()->find($event->id);
            $projects = SupabaseRepository::projects()->all();
            return Inertia::render('Calendar/Edit', [
                'event' => $event,
                'projects' => $projects,
            ]);
        }

        $projects = Project::all();
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

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::events()->update($event->id, $validated);
        } else {
            $event->update($validated);
        }

        return redirect()->route('calendar.index')
            ->with('success', 'Termin erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified event.
     */
    public function destroy(Event $event)
    {
        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::events()->delete($event->id);
        } else {
            $event->delete();
        }

        return redirect()->route('calendar.index')
            ->with('success', 'Termin erfolgreich gelöscht.');
    }
}
