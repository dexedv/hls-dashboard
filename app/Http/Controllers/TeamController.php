<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Label;
use App\Repositories\SupabaseRepository;
use App\Helpers\SupabaseHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    /**
     * Display a listing of team members.
     */
    public function index(Request $request)
    {
        if (SupabaseHelper::useSupabase()) {
            $users = SupabaseRepository::users()->all();

            // Get all labels and user_labels to attach to users
            $allLabels = [];
            $allUserLabels = [];
            try {
                $allLabels = SupabaseRepository::labels()->all()->keyBy('id')->toArray();
                $allUserLabels = SupabaseRepository::userLabels()->get()->toArray();
            } catch (\Exception $e) {
                // Tables might not exist yet
            }

            // Attach labels to each user
            $users = $users->map(function ($user) use ($allLabels, $allUserLabels) {
                $userLabelIds = array_filter($allUserLabels, fn($ul) => $ul['user_id'] == $user['id']);
                $user['labels'] = array_values(array_map(function($ul) use ($allLabels) {
                    return $allLabels[$ul['label_id']] ?? null;
                }, array_filter($userLabelIds, fn($ul) => isset($allLabels[$ul['label_id']]))));
                return $user;
            });

            $users = SupabaseHelper::toPaginated($users, 10);

            return Inertia::render('Team/Index', [
                'users' => $users,
                'labels' => array_values($allLabels),
            ]);
        }

        $users = User::with('labels')->orderBy('name', 'asc')->paginate(10);
        $labels = Label::all();

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
        return Inertia::render('Team/Create');
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
            'role' => 'nullable|in:admin,manager,employee,viewer,support,finance,sales,guest',
            'phone' => 'nullable|string|max:50',
            'labels' => 'nullable|array',
        ]);

        $labels = $validated['labels'] ?? [];
        unset($validated['labels']);

        $validated['password'] = bcrypt($validated['password']);

        if (SupabaseHelper::useSupabase()) {
            // Only send fields that exist in Supabase users table
            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => $validated['role'] ?? 'employee',
            ];
            if (!empty($validated['phone'])) {
                $userData['phone'] = $validated['phone'];
            }
            $user = SupabaseRepository::users()->create($userData);

            // Attach labels via pivot table
            if (!empty($labels)) {
                foreach ($labels as $labelId) {
                    SupabaseRepository::userLabels()->create([
                        'user_id' => $user['id'],
                        'label_id' => $labelId,
                    ]);
                }
            }
        } else {
            if (auth()->check()) {
                $validated['created_by'] = auth()->id();
            }
            $user = User::create($validated);

            // Attach labels
            if (!empty($labels)) {
                $user->labels()->attach($labels);
            }
        }

        return redirect()->route('team.index')
            ->with('success', 'Teammitglied erfolgreich erstellt.');
    }

    /**
     * Display the specified team member.
     */
    public function show(User $user)
    {
        if (SupabaseHelper::useSupabase()) {
            $user = SupabaseRepository::users()->find($user->id);
            return Inertia::render('Team/Show', [
                'user' => $user,
            ]);
        }

        return Inertia::render('Team/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified team member.
     */
    public function edit($id)
    {
        if (SupabaseHelper::useSupabase()) {
            $user = SupabaseRepository::users()->find($id);

            // Get all available labels
            try {
                $allLabels = SupabaseRepository::labels()->all()->toArray();
            } catch (\Exception $e) {
                $allLabels = [];
            }

            // Get user's assigned labels
            try {
                $allUserLabels = SupabaseRepository::userLabels()->get();
                $userLabelIds = $allUserLabels->filter(function($ul) use ($id) {
                    return $ul['user_id'] == $id;
                })->pluck('label_id')->toArray();

                // Add labels to user object
                $user['labels'] = collect($allLabels)->filter(function($label) use ($userLabelIds) {
                    return in_array($label['id'], $userLabelIds, true);
                })->values()->toArray();
            } catch (\Exception $e) {
                $user['labels'] = [];
            }

            $labels = $allLabels;
        } else {
            $user = User::with('labels')->findOrFail($id);
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
            'role' => 'nullable|in:admin,manager,employee,viewer,support,finance,sales,guest',
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

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::users()->update($id, $validated);

            // Update labels - first delete old, then add new
            try {
                $allUserLabels = SupabaseRepository::userLabels()->get();
                $existingLabels = $allUserLabels->filter(function($ul) use ($id) {
                    return $ul['user_id'] == $id;
                });

                foreach ($existingLabels as $existingLabel) {
                    SupabaseRepository::userLabels()->delete($existingLabel['id']);
                }

                foreach ($labels as $labelId) {
                    SupabaseRepository::userLabels()->create([
                        'user_id' => $id,
                        'label_id' => $labelId,
                    ]);
                }
            } catch (\Exception $e) {
                // Ignore label errors
            }
        } else {
            $user = User::findOrFail($id);
            $user->update($validated);
            $user->labels()->sync($labels);
        }

        return redirect()->route('team.index')
            ->with('success', 'Teammitglied erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified team member.
     */
    public function destroy($id)
    {
        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::users()->delete($id);
        } else {
            $user = User::findOrFail($id);
            $user->delete();
        }

        return redirect()->route('team.index')
            ->with('success', 'Teammitglied erfolgreich gelöscht.');
    }
}
