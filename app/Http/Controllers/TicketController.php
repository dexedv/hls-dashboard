<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Customer;
use App\Models\Project;
use App\Models\User;
use App\Helpers\StatusHelper;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketController extends Controller
{
    /**
     * Display a listing of tickets.
     */
    public function index(Request $request)
    {
        $query = Ticket::query()->with(['customer', 'project', 'assignees']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'ilike', "%{$request->search}%")
                    ->orWhere('description', 'ilike', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->priority) {
            $query->where('priority', $request->priority);
        }

        $tickets = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $projects = Project::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
            'customers' => $customers,
            'projects' => $projects,
            'users' => $users,
            'statuses' => StatusHelper::ticketStatuses(),
            'priorities' => StatusHelper::priorities(),
            'filters' => $request->only(['search', 'status', 'priority']),
        ]);
    }

    /**
     * Show the form for creating a new ticket.
     */
    public function create(Request $request)
    {
        $customers = Customer::orderBy('name')->get(['id', 'name', 'email']);
        $projects = Project::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Tickets/Create', [
            'customers' => $customers,
            'projects' => $projects,
            'users' => $users,
            'customer_id' => $request->customer_id,
            'project_id' => $request->project_id,
        ]);
    }

    /**
     * Store a newly created ticket.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'customer_id' => 'nullable',
            'project_id' => 'nullable',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'assigned_users' => 'nullable|array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['status'] = 'open';
        $validated['priority'] = $validated['priority'] ?? 'medium';

        $assignedUsers = $validated['assigned_users'] ?? [];
        unset($validated['assigned_users']);

        $ticket = Ticket::create($validated);
        $ticket->assignees()->sync($assignedUsers);

        foreach ($assignedUsers as $userId) {
            NotificationService::notifyUser(
                $userId,
                'Neues Ticket zugewiesen',
                'Ihnen wurde das Ticket "' . $ticket->title . '" zugewiesen.',
                'info',
                route('tickets.show', $ticket->id)
            );
        }

        return redirect()->route('tickets.index')
            ->with('success', 'Ticket erfolgreich erstellt.');
    }

    /**
     * Display the specified ticket.
     */
    public function show(Ticket $ticket)
    {
        $ticket->load(['customer', 'project', 'assignees', 'creator', 'comments.user']);

        return Inertia::render('Tickets/Show', [
            'ticket' => $ticket,
        ]);
    }

    /**
     * Show the form for editing the specified ticket.
     */
    public function edit(Ticket $ticket)
    {
        $ticket->load('assignees');
        $customers = Customer::orderBy('name')->get(['id', 'name', 'email']);
        $projects = Project::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Tickets/Edit', [
            'ticket' => $ticket,
            'customers' => $customers,
            'projects' => $projects,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified ticket.
     */
    public function update(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'customer_id' => 'nullable',
            'project_id' => 'nullable',
            'status' => 'nullable|in:open,in_progress,pending,resolved,closed',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'assigned_users' => 'nullable|array',
            'assigned_users.*' => 'exists:users,id',
        ]);

        $assignedUsers = $validated['assigned_users'] ?? [];
        unset($validated['assigned_users']);

        $ticket->update($validated);
        $ticket->assignees()->sync($assignedUsers);

        return redirect()->route('tickets.show', $ticket->id)
            ->with('success', 'Ticket erfolgreich aktualisiert.');
    }

    /**
     * Add a comment to the ticket.
     */
    public function addComment(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $ticket->comments()->create([
            'user_id' => auth()->id(),
            'content' => $validated['content'],
        ]);

        return redirect()->back()
            ->with('success', 'Kommentar hinzugefügt.');
    }

    /**
     * Remove the specified ticket.
     */
    public function destroy(Ticket $ticket)
    {
        $ticket->delete();

        return redirect()->route('tickets.index')
            ->with('success', 'Ticket erfolgreich gelöscht.');
    }
}
