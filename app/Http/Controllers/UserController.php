<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', "%{$request->search}%")
                    ->orWhere('email', 'ilike', "%{$request->search}%");
            });
        }

        $users = $query->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'password' => 'nullable|string|min:8',
            'role' => 'nullable|in:owner,admin,manager,employee,viewer,support,finance,sales,guest',
            'permissions' => 'nullable|array',
        ]);

        $permissions = $validated['permissions'] ?? [];
        unset($validated['permissions']);

        if ($validated['password']) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user = User::findOrFail($id);
        $user->update($validated);

        // Update permissions
        if (!empty($permissions)) {
            $user->permissions()->sync($permissions);
        }

        return redirect()->back()->with('success', 'Benutzer erfolgreich aktualisiert.');
    }

    /**
     * Approve a user account
     */
    public function approve(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_approved' => true]);

        return redirect()->back()->with('success', 'Benutzer wurde freigeschaltet.');
    }

    /**
     * Disapprove (deactivate) a user account
     */
    public function disapprove(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_approved' => false]);

        return redirect()->back()->with('success', 'Benutzer wurde deaktiviert.');
    }
}
