<?php

namespace App\Http\Controllers;

use App\Helpers\PermissionHelper;
use App\Models\RolePermission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $roles = PermissionHelper::getRoles();
        $permissions = PermissionHelper::getAllPermissions();

        // Get stored permissions from database
        $storedPermissions = RolePermission::all()
            ->groupBy('role')
            ->map(fn($items) => $items->pluck('allowed', 'permission')->toArray());

        // Merge with defaults
        $rolePermissions = [];
        foreach (array_keys($roles) as $role) {
            $defaults = PermissionHelper::getRolePermissions($role);
            $stored = $storedPermissions[$role] ?? [];
            $rolePermissions[$role] = array_merge($defaults, $stored);
        }

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'rolePermissions' => $rolePermissions,
        ]);
    }

    public function permissions()
    {
        $roles = PermissionHelper::getRoles();
        $permissions = PermissionHelper::getAllPermissions();

        // Get stored permissions from database
        $storedPermissions = RolePermission::all()
            ->groupBy('role')
            ->map(fn($items) => $items->pluck('allowed', 'permission')->toArray());

        // Merge with defaults
        $rolePermissions = [];
        foreach (array_keys($roles) as $role) {
            $defaults = PermissionHelper::getRolePermissions($role);
            $stored = $storedPermissions[$role] ?? [];
            $rolePermissions[$role] = array_merge($defaults, $stored);
        }

        return Inertia::render('Permissions/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'rolePermissions' => $rolePermissions,
        ]);
    }

    /**
     * Update role permissions
     */
    public function updatePermissions(Request $request)
    {
        $validated = $request->validate([
            'role' => 'required|string',
            'permissions' => 'required|array',
        ]);

        $role = $validated['role'];
        $permissions = $validated['permissions'];

        // Update each permission
        foreach ($permissions as $permission => $allowed) {
            RolePermission::updateOrCreate(
                [
                    'role' => $role,
                    'permission' => $permission,
                ],
                [
                    'allowed' => $allowed,
                ]
            );
        }

        // Clear cache
        cache()->forget('role_permissions_' . $role);

        return response()->json([
            'success' => true,
            'message' => 'Berechtigungen für Rolle "' . $role . '" gespeichert',
        ]);
    }

    /**
     * Reset role to default permissions
     */
    public function resetRole(Request $request)
    {
        $validated = $request->validate([
            'role' => 'required|string',
        ]);

        // Delete all stored permissions for this role
        RolePermission::where('role', $validated['role'])->delete();

        // Clear cache
        cache()->forget('role_permissions_' . $validated['role']);

        return response()->json([
            'success' => true,
            'message' => 'Rolle "' . $validated['role'] . '" auf Standardwerte zurückgesetzt',
        ]);
    }
}
