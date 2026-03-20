<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Label;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    /**
     * Display a listing of team members.
     */
    public function index(Request $request)
    {
        // Create default labels if none exist
        $localLabels = Label::all();
        if ($localLabels->isEmpty()) {
            $defaultLabels = [
                ['name' => 'Außendienst', 'slug' => 'aussendienst', 'color' => '#10b981'],
                ['name' => 'Innendienst', 'slug' => 'innendienst', 'color' => '#3b82f6'],
                ['name' => 'Techniker', 'slug' => 'techniker', 'color' => '#f59e0b'],
                ['name' => 'Vertrieb', 'slug' => 'vertrieb', 'color' => '#8b5cf6'],
                ['name' => 'Support', 'slug' => 'support', 'color' => '#ec4899'],
                ['name' => 'Verwaltung', 'slug' => 'verwaltung', 'color' => '#6b7280'],
            ];
            foreach ($defaultLabels as $labelData) {
                Label::firstOrCreate(['slug' => $labelData['slug']], $labelData);
            }
        }
        $labels = Label::all()->toArray();

        $users = User::with('labels')->orderBy('name', 'asc')->paginate(10);

        return Inertia::render('Team/Index', [
            'users' => $users,
            'labels' => $labels,
        ]);
    }

    /**
     * Show the form for creating a new team member.
     */
    public function create()
    {
        // Create default labels if none exist
        $labels = Label::all();
        if ($labels->isEmpty()) {
            $defaultLabels = [
                ['name' => 'Außendienst', 'slug' => 'aussendienst', 'color' => '#10b981'],
                ['name' => 'Innendienst', 'slug' => 'innendienst', 'color' => '#3b82f6'],
                ['name' => 'Techniker', 'slug' => 'techniker', 'color' => '#f59e0b'],
                ['name' => 'Vertrieb', 'slug' => 'vertrieb', 'color' => '#8b5cf6'],
                ['name' => 'Support', 'slug' => 'support', 'color' => '#ec4899'],
                ['name' => 'Verwaltung', 'slug' => 'verwaltung', 'color' => '#6b7280'],
            ];
            foreach ($defaultLabels as $labelData) {
                Label::firstOrCreate(['slug' => $labelData['slug']], $labelData);
            }
            $labels = Label::all();
        }

        return Inertia::render('Team/Create', [
            'labels' => $labels,
        ]);
    }

    /**
     * Store a newly created team member.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'nullable|in:owner,admin,manager,employee,viewer,support,finance,sales,guest',
            'phone' => 'nullable|string|max:50',
            'labels' => 'nullable|array',
        ]);

        $labels = $validated['labels'] ?? [];
        unset($validated['labels']);

        $validated['password'] = bcrypt($validated['password']);

        if (auth()->check()) {
            $validated['created_by'] = auth()->id();
        }
        $user = User::create($validated);

        // Attach labels
        if (!empty($labels)) {
            $user->labels()->attach($labels);
        }

        return redirect()->route('team.index')
            ->with('success', 'Teammitglied erfolgreich erstellt.');
    }

    /**
     * Display the specified team member.
     */
    public function show(User $user)
    {
        return Inertia::render('Team/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified team member.
     */
    public function edit($id)
    {
        // Get user with labels
        $user = User::with('labels')->findOrFail($id);

        // Get all available labels, create default labels if none exist
        $labels = Label::all();
        if ($labels->isEmpty()) {
            // Create default labels automatically
            $defaultLabels = [
                ['name' => 'Außendienst', 'slug' => 'aussendienst', 'color' => '#10b981'],
                ['name' => 'Innendienst', 'slug' => 'innendienst', 'color' => '#3b82f6'],
                ['name' => 'Techniker', 'slug' => 'techniker', 'color' => '#f59e0b'],
                ['name' => 'Vertrieb', 'slug' => 'vertrieb', 'color' => '#8b5cf6'],
                ['name' => 'Support', 'slug' => 'support', 'color' => '#ec4899'],
                ['name' => 'Verwaltung', 'slug' => 'verwaltung', 'color' => '#6b7280'],
            ];
            foreach ($defaultLabels as $labelData) {
                Label::firstOrCreate(['slug' => $labelData['slug']], $labelData);
            }
            $labels = Label::all();
        }

        return Inertia::render('Team/Edit', [
            'user' => $user,
            'labels' => $labels,
        ]);
    }

    /**
     * Update the specified team member.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'password' => 'nullable|string|min:8',
            'role' => 'nullable|in:owner,admin,manager,employee,viewer,support,finance,sales,guest',
            'phone' => 'nullable|string|max:50',
            'labels' => 'nullable|array',
        ]);

        $labels = $validated['labels'] ?? [];
        unset($validated['labels']);

        if ($validated['password']) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user = User::findOrFail($id);
        $user->update($validated);
        $user->labels()->sync($labels);

        return redirect()->route('team.index')
            ->with('success', 'Teammitglied erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified team member.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->route('team.index')
            ->with('success', 'Teammitglied erfolgreich gelöscht.');
    }
}
