<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Project;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NoteController extends Controller
{
    /**
     * Display a listing of notes.
     */
    public function index(Request $request)
    {
        $query = Note::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'ilike', "%{$request->search}%")
                    ->orWhere('content', 'ilike', "%{$request->search}%");
            });
        }

        // Get pinned notes
        $pinned = Note::where('pinned', true)
            ->orderBy('created_at', 'desc')
            ->get();

        $notes = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $projects = Project::all();
        $customers = Customer::all();

        return Inertia::render('Notes/Index', [
            'notes' => $notes,
            'pinned' => $pinned,
            'projects' => $projects,
            'customers' => $customers,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new note.
     */
    public function create(Request $request)
    {
        $projects = Project::all();
        $customers = Customer::all();
        return Inertia::render('Notes/Create', [
            'projects' => $projects,
            'customers' => $customers,
            'project_id' => $request->project_id,
            'customer_id' => $request->customer_id,
        ]);
    }

    /**
     * Store a newly created note.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'project_id' => 'nullable',
            'customer_id' => 'nullable',
            'pinned' => 'boolean',
        ]);

        $validated['created_by'] = auth()->id();

        Note::create($validated);

        return redirect()->route('notes.index')
            ->with('success', 'Notiz erfolgreich erstellt.');
    }

    /**
     * Display the specified note.
     */
    public function show(Note $note)
    {
        $note->load(['project', 'customer', 'creator']);

        return Inertia::render('Notes/Show', [
            'note' => $note,
        ]);
    }

    /**
     * Show the form for editing the specified note.
     */
    public function edit(Note $note)
    {
        $projects = Project::all();
        $customers = Customer::all();

        return Inertia::render('Notes/Edit', [
            'note' => $note,
            'projects' => $projects,
            'customers' => $customers,
        ]);
    }

    /**
     * Update the specified note.
     */
    public function update(Request $request, Note $note)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'project_id' => 'nullable',
            'customer_id' => 'nullable',
            'pinned' => 'boolean',
        ]);

        $note->update($validated);

        return redirect()->route('notes.index')
            ->with('success', 'Notiz erfolgreich aktualisiert.');
    }

    /**
     * Toggle pinned status.
     */
    public function togglePin(Note $note)
    {
        $note->update([
            'pinned' => !$note->pinned,
        ]);

        return redirect()->back();
    }

    /**
     * Remove the specified note.
     */
    public function destroy(Note $note)
    {
        $note->delete();

        return redirect()->route('notes.index')
            ->with('success', 'Notiz erfolgreich gelöscht.');
    }
}
