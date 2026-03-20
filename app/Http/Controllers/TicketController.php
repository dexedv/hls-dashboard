<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Customer;
use App\Models\Project;
use App\Models\User;
use App\Helpers\StatusHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketController extends Controller
{
    /**
     * Display a listing of tickets.
     */
    public function index(Request $request)
    {
        $query = Ticket::query()->with(['customer', 'project', 'assignee']);

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
        $customers = Customer::all();
        $projects = Project::all();
        $users = User::all();

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
            'assigned_to' => 'nullable',
            'priority' => 'nullable|in:low,medium,high,urgent',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['status'] = 'open';
        $validated['priority'] = $validated['priority'] ?? 'medium';

        Ticket::create($validated);

        return redirect()->route('tickets.index')
            ->with('success', 'Ticket erfolgreich erstellt.');
    }

    /**
     * Display the specified ticket.
     */
    public function show(Ticket $ticket)
    {
        $ticket->load(['customer', 'project', 'assignee', 'creator', 'comments.user']);

        return Inertia::render('Tickets/Show', [
            'ticket' => $ticket,
        ]);
    }

    /**
     * Show the form for editing the specified ticket.
     */
    public function edit(Ticket $ticket)
    {
        $customers = Customer::all();
        $projects = Project::all();
        $users = User::all();

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
            'assigned_to' => 'nullable',
            'status' => 'nullable|in:open,in_progress,pending,resolved,closed',
            'priority' => 'nullable|in:low,medium,high,urgent',
        ]);

        $ticket->update($validated);

        return redirect()->route('tickets.index')
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
