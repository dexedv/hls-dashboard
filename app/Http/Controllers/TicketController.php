<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Customer;
use App\Models\Project;
use App\Models\User;
use App\Repositories\SupabaseRepository;
use App\Helpers\SupabaseHelper;
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
        if (SupabaseHelper::useSupabase()) {
            $tickets = SupabaseRepository::tickets()->all();

            if ($request->search) {
                $search = strtolower($request->search);
                $tickets = $tickets->filter(function($t) use ($search) {
                    return str_contains(strtolower($t['title'] ?? ''), $search) ||
                           str_contains(strtolower($t['description'] ?? ''), $search);
                });
            }

            if ($request->status) {
                $tickets = $tickets->where('status', $request->status);
            }

            if ($request->priority) {
                $tickets = $tickets->where('priority', $request->priority);
            }

            $tickets = SupabaseHelper::toPaginated($tickets, 10);

            return Inertia::render('Tickets/Index', [
                'tickets' => $tickets,
                'filters' => $request->only(['search', 'status', 'priority']),
                'statuses' => StatusHelper::ticketStatuses(),
                'priorities' => StatusHelper::priorities(),
            ]);
        }

        $query = Ticket::query()->with(['customer', 'project', 'assignee']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
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

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
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
        if (SupabaseHelper::useSupabase()) {
            $customers = SupabaseRepository::customers()->all();
            $projects = SupabaseRepository::projects()->all();
            $users = SupabaseRepository::users()->all();

            return Inertia::render('Tickets/Create', [
                'customers' => $customers,
                'projects' => $projects,
                'users' => $users,
                'customer_id' => $request->customer_id,
                'project_id' => $request->project_id,
            ]);
        }

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

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::tickets()->create($validated);
        } else {
            Ticket::create($validated);
        }

        return redirect()->route('tickets.index')
            ->with('success', 'Ticket erfolgreich erstellt.');
    }

    /**
     * Display the specified ticket.
     */
    public function show(Ticket $ticket)
    {
        if (SupabaseHelper::useSupabase()) {
            $ticket = SupabaseRepository::tickets()->find($ticket->id);
            return Inertia::render('Tickets/Show', [
                'ticket' => $ticket,
            ]);
        }

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
        if (SupabaseHelper::useSupabase()) {
            $ticket = SupabaseRepository::tickets()->find($ticket->id);
            $customers = SupabaseRepository::customers()->all();
            $projects = SupabaseRepository::projects()->all();
            $users = SupabaseRepository::users()->all();

            return Inertia::render('Tickets/Edit', [
                'ticket' => $ticket,
                'customers' => $customers,
                'projects' => $projects,
                'users' => $users,
            ]);
        }

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

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::tickets()->update($ticket->id, $validated);
        } else {
            $ticket->update($validated);
        }

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

        if (SupabaseHelper::useSupabase()) {
            // For Supabase, we would need to add comments to the ticket
            // This assumes the tickets table has a JSON column for comments
            $ticketData = SupabaseRepository::tickets()->find($ticket->id);
            $comments = $ticketData['comments'] ?? [];
            $comments[] = [
                'user_id' => auth()->id(),
                'content' => $validated['content'],
                'created_at' => now(),
            ];
            SupabaseRepository::tickets()->update($ticket->id, ['comments' => $comments]);
        } else {
            $ticket->comments()->create([
                'user_id' => auth()->id(),
                'content' => $validated['content'],
            ]);
        }

        return redirect()->back()
            ->with('success', 'Kommentar hinzugefügt.');
    }

    /**
     * Remove the specified ticket.
     */
    public function destroy(Ticket $ticket)
    {
        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::tickets()->delete($ticket->id);
        } else {
            $ticket->delete();
        }

        return redirect()->route('tickets.index')
            ->with('success', 'Ticket erfolgreich gelöscht.');
    }
}
