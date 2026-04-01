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
        $showArchived = $request->boolean('show_archived');
        $query = Ticket::query()->with(['customer', 'project', 'assignees']);

        if ($showArchived) {
            $query->whereNotNull('archived_at');
        } else {
            $query->whereNull('archived_at');
        }

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

        $sort = $request->sort ?? 'created_desc';
        match ($sort) {
            'status'      => $query->orderByRaw("CASE status WHEN 'open' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'pending' THEN 3 WHEN 'resolved' THEN 4 WHEN 'closed' THEN 5 ELSE 6 END ASC"),
            'priority'    => $query->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 ELSE 5 END ASC"),
            'created_asc' => $query->orderBy('created_at', 'asc'),
            default       => $query->orderBy('created_at', 'desc'),
        };

        $tickets = $query->paginate(10)->withQueryString();

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
            'filters' => (object) $request->only(['search', 'status', 'priority', 'sort', 'show_archived']),
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
            'priority' => 'nullable|in:low,medium,high,urgent,critical',
            'assigned_users' => 'nullable|array',
            'assigned_users.*' => 'exists:users,id',
            'sla_hours' => 'nullable|integer|min:1',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['status'] = 'open';
        $validated['priority'] = $validated['priority'] ?? 'medium';

        $assignedUsers = $validated['assigned_users'] ?? [];
        unset($validated['assigned_users']);

        $ticket = Ticket::create($validated);
        $ticket->assignees()->sync($assignedUsers);

        NotificationService::notifyAssigned(
            array_map('intval', $assignedUsers),
            'Neues Ticket: ' . $ticket->title,
            'Du wurdest einem Ticket zugewiesen.',
            route('tickets.show', $ticket->id),
            auth()->id()
        );

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

        $assignedUsers   = array_map('intval', $validated['assigned_users'] ?? []);
        $existingUserIds = $ticket->assignees->pluck('id')->map(fn($id) => (int)$id)->toArray();
        unset($validated['assigned_users']);

        $ticket->update($validated);
        $ticket->assignees()->sync($assignedUsers);

        if (in_array($ticket->status, ['closed', 'resolved']) && !$ticket->archived_at) {
            $ticket->update(['archived_at' => now()]);
        } elseif (!in_array($ticket->status, ['closed', 'resolved']) && $ticket->archived_at) {
            $ticket->update(['archived_at' => null]);
        }

        NotificationService::notifyNewlyAssigned(
            $assignedUsers, $existingUserIds,
            'Ticket: ' . $ticket->title,
            'Du wurdest einem Ticket zugewiesen.',
            route('tickets.show', $ticket->id),
            auth()->id()
        );

        return redirect()->route('tickets.show', $ticket->id)
            ->with('success', 'Ticket erfolgreich aktualisiert.');
    }

    /**
     * Update only the status of a ticket.
     */
    public function updateStatus(Request $request, Ticket $ticket)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,pending,resolved,closed',
        ]);

        $ticket->update(['status' => $request->status]);

        if (in_array($request->status, ['closed', 'resolved']) && !$ticket->resolved_at) {
            $ticket->update(['resolved_at' => now()]);
        }

        if (in_array($request->status, ['closed', 'resolved']) && !$ticket->archived_at) {
            $ticket->update(['archived_at' => now()]);
        } elseif (!in_array($request->status, ['closed', 'resolved']) && $ticket->archived_at) {
            $ticket->update(['archived_at' => null]);
        }

        return redirect()->back()->with('success', 'Status aktualisiert.');
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
     * Archive the specified ticket.
     */
    public function archive(Ticket $ticket)
    {
        $ticket->update(['archived_at' => now()]);

        return redirect()->back()->with('success', 'Ticket archiviert.');
    }

    /**
     * Restore an archived ticket.
     */
    public function restore(Ticket $ticket)
    {
        $ticket->update(['archived_at' => null]);

        return redirect()->back()->with('success', 'Ticket wiederhergestellt.');
    }

    /**
     * Bulk archive tickets.
     */
    public function bulkArchive(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tickets,id',
        ]);

        Ticket::whereIn('id', $request->ids)->update(['archived_at' => now()]);

        return redirect()->back()->with('success', count($request->ids) . ' Tickets archiviert.');
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
