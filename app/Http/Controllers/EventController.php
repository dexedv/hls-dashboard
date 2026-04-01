<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Event;
use App\Models\Project;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::query()->with(['project', 'customer', 'assignees']);

        if ($request->month && $request->year) {
            $query->whereMonth('start', $request->month)
                  ->whereYear('start', $request->year);
        }

        $events    = $query->orderBy('start', 'asc')->get();
        $projects  = Project::orderBy('name')->get(['id', 'name']);
        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $users     = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Calendar/Index', [
            'events'    => $events,
            'projects'  => $projects,
            'customers' => $customers,
            'users'     => $users,
        ]);
    }

    public function create()
    {
        $projects  = Project::orderBy('name')->get(['id', 'name']);
        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $users     = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Calendar/Create', [
            'projects'  => $projects,
            'customers' => $customers,
            'users'     => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'event_type'       => 'nullable|string|max:50',
            'start'            => 'required|date',
            'end'              => 'nullable|date',
            'all_day'          => 'boolean',
            'project_id'       => 'nullable|exists:projects,id',
            'customer_id'      => 'nullable|exists:customers,id',
            'tags'             => 'nullable|array',
            'tags.*'           => 'string|max:50',
            'assigned_users'   => 'nullable|array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        $validated['created_by'] = auth()->id();

        $assignedUsers = $validated['assigned_users'] ?? [];
        unset($validated['assigned_users']);

        $event = Event::create($validated);
        $event->assignees()->sync($assignedUsers);

        NotificationService::notifyAssigned(
            array_map('intval', $assignedUsers),
            'Neuer Termin: ' . $event->title,
            'Du wurdest zum Termin am ' . $event->start->format('d.m.Y') . ' eingeladen.',
            route('calendar.show', $event->id),
            auth()->id()
        );

        return redirect()->route('calendar.index')
            ->with('success', 'Termin erfolgreich erstellt.');
    }

    public function show(Event $calendar)
    {
        $calendar->load(['project', 'customer', 'assignees']);

        return Inertia::render('Calendar/Show', [
            'event' => $calendar,
        ]);
    }

    public function edit(Event $calendar)
    {
        $calendar->load('assignees');

        $projects  = Project::orderBy('name')->get(['id', 'name']);
        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $users     = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Calendar/Edit', [
            'event'     => $calendar,
            'projects'  => $projects,
            'customers' => $customers,
            'users'     => $users,
        ]);
    }

    public function update(Request $request, Event $calendar)
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'event_type'       => 'nullable|string|max:50',
            'start'            => 'required|date',
            'end'              => 'nullable|date',
            'all_day'          => 'boolean',
            'project_id'       => 'nullable|exists:projects,id',
            'customer_id'      => 'nullable|exists:customers,id',
            'tags'             => 'nullable|array',
            'tags.*'           => 'string|max:50',
            'assigned_users'   => 'nullable|array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        $assignedUsers   = array_map('intval', $validated['assigned_users'] ?? []);
        $existingUserIds = $calendar->assignees->pluck('id')->map(fn($id) => (int)$id)->toArray();
        unset($validated['assigned_users']);

        $calendar->update($validated);
        $calendar->assignees()->sync($assignedUsers);

        NotificationService::notifyNewlyAssigned(
            $assignedUsers,
            $existingUserIds,
            'Termin: ' . $calendar->title,
            'Du wurdest zum Termin am ' . $calendar->start->format('d.m.Y') . ' eingeladen.',
            route('calendar.show', $calendar->id),
            auth()->id()
        );

        return redirect()->route('calendar.index')
            ->with('success', 'Termin erfolgreich aktualisiert.');
    }

    public function destroy(Event $calendar)
    {
        $calendar->delete();

        return redirect()->route('calendar.index')
            ->with('success', 'Termin erfolgreich gelöscht.');
    }
}
