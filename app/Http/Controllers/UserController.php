<?php

namespace App\Http\Controllers;

use App\Helpers\SupabaseHelper;
use App\Repositories\SupabaseRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        if (SupabaseHelper::useSupabase()) {
            $users = SupabaseRepository::users()->all();
        } else {
            $users = \App\Models\User::all();
        }

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'password' => 'nullable|string|min:8',
            'role' => 'nullable|in:admin,manager,employee,viewer,owner',
            'permissions' => 'nullable|array',
        ]);

        $permissions = $validated['permissions'] ?? [];
        unset($validated['permissions']);

        if ($validated['password']) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::users()->update($id, $validated);

            // Update user permissions
            if (!empty($permissions)) {
                // Store permissions in a separate table or user metadata
                foreach ($permissions as $key => $value) {
                    SupabaseRepository::userPermissions()->create([
                        'user_id' => $id,
                        'permission_key' => $key,
                        'permission_value' => $value,
                    ]);
                }
            }
        } else {
            $user = \App\Models\User::findOrFail($id);
            $user->update($validated);

            // Update permissions
            if (!empty($permissions)) {
                $user->permissions()->sync($permissions);
            }
        }

        return redirect()->back()->with('success', 'Benutzer erfolgreich aktualisiert.');
    }
}
