<?php

namespace App\Helpers;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\RolePermission;

class PermissionHelper
{
    /**
     * Get all available permissions grouped by module
     */
    public static function getAllPermissions(): array
    {
        return [
            'dashboard' => [
                'dashboard.view' => 'Dashboard anzeigen',
            ],
            'crm' => [
                'crm.view' => 'Kunden anzeigen',
                'crm.create' => 'Kunden erstellen',
                'crm.edit' => 'Kunden bearbeiten',
                'crm.delete' => 'Kunden löschen',
                'crm.export' => 'Kunden exportieren',
            ],
            'leads' => [
                'leads.view' => 'Leads anzeigen',
                'leads.create' => 'Leads erstellen',
                'leads.edit' => 'Leads bearbeiten',
                'leads.delete' => 'Leads löschen',
                'leads.convert' => 'Leads konvertieren',
                'leads.export' => 'Leads exportieren',
            ],
            'projects' => [
                'projects.view' => 'Projekte anzeigen',
                'projects.create' => 'Projekte erstellen',
                'projects.edit' => 'Projekte bearbeiten',
                'projects.delete' => 'Projekte löschen',
                'projects.assign' => 'Projekte zuweisen',
                'projects.export' => 'Projekte exportieren',
            ],
            'tasks' => [
                'tasks.view' => 'Aufgaben anzeigen',
                'tasks.create' => 'Aufgaben erstellen',
                'tasks.edit' => 'Aufgaben bearbeiten',
                'tasks.delete' => 'Aufgaben löschen',
                'tasks.assign' => 'Aufgaben zuweisen',
                'tasks.complete' => 'Aufgaben abschließen',
            ],
            'calendar' => [
                'calendar.view' => 'Kalender anzeigen',
                'calendar.create' => 'Termine erstellen',
                'calendar.edit' => 'Termine bearbeiten',
                'calendar.delete' => 'Termine löschen',
            ],
            'finances' => [
                'finances.view' => 'Finanzen anzeigen',
                'finances.create' => 'Finanzen erstellen',
                'finances.edit' => 'Finanzen bearbeiten',
                'finances.delete' => 'Finanzen löschen',
                'finances.export' => 'Finanzen exportieren',
            ],
            'invoices' => [
                'invoices.view' => 'Rechnungen anzeigen',
                'invoices.create' => 'Rechnungen erstellen',
                'invoices.edit' => 'Rechnungen bearbeiten',
                'invoices.delete' => 'Rechnungen löschen',
                'invoices.send' => 'Rechnungen senden',
                'invoices.export' => 'Rechnungen exportieren',
                'invoices.mark_paid' => 'Als bezahlt markieren',
            ],
            'quotes' => [
                'quotes.view' => 'Angebote anzeigen',
                'quotes.create' => 'Angebote erstellen',
                'quotes.edit' => 'Angebote bearbeiten',
                'quotes.delete' => 'Angebote löschen',
                'quotes.export' => 'Angebote exportieren',
            ],
            'time_tracking' => [
                'time_tracking.view' => 'Zeiterfassung anzeigen',
                'time_tracking.create' => 'Zeiten erfassen',
                'time_tracking.edit' => 'Zeiten bearbeiten',
                'time_tracking.delete' => 'Zeiten löschen',
                'time_tracking.approve' => 'Zeiten genehmigen',
            ],
            'team' => [
                'team.view' => 'Team anzeigen',
                'team.create' => 'Mitarbeiter erstellen',
                'team.edit' => 'Mitarbeiter bearbeiten',
                'team.delete' => 'Mitarbeiter löschen',
                'team.assign_roles' => 'Rollen zuweisen',
            ],
            'leave' => [
                'leave.view' => 'Urlaub anzeigen',
                'leave.create' => 'Urlaub beantragen',
                'leave.edit' => 'Urlaub bearbeiten',
                'leave.delete' => 'Urlaub löschen',
                'leave.approve' => 'Urlaub genehmigen',
            ],
            'notes' => [
                'notes.view' => 'Notizen anzeigen',
                'notes.create' => 'Notizen erstellen',
                'notes.edit' => 'Notizen bearbeiten',
                'notes.delete' => 'Notizen löschen',
            ],
            'inventory' => [
                'inventory.view' => 'Inventar anzeigen',
                'inventory.create' => 'Artikel erstellen',
                'inventory.edit' => 'Artikel bearbeiten',
                'inventory.delete' => 'Artikel löschen',
                'inventory.export' => 'Inventar exportieren',
            ],
            'wms' => [
                'wms.view' => 'Warenwirtschaft anzeigen',
                'wms.create' => 'Bewegungen erstellen',
                'wms.edit' => 'Bewegungen bearbeiten',
                'wms.delete' => 'Bewegungen löschen',
                'wms.approve' => 'Genehmigen',
            ],
            'barcode' => [
                'barcode.view' => 'Barcode anzeigen',
                'barcode.create' => 'Barcode erstellen',
                'barcode.scan' => 'Scannen',
                'barcode.print' => 'Drucken',
            ],
            'statistics' => [
                'statistics.view' => 'Statistiken anzeigen',
                'statistics.export' => 'Statistiken exportieren',
            ],
            'tickets' => [
                'tickets.view' => 'Tickets anzeigen',
                'tickets.create' => 'Tickets erstellen',
                'tickets.edit' => 'Tickets bearbeiten',
                'tickets.delete' => 'Tickets löschen',
                'tickets.assign' => 'Tickets zuweisen',
                'tickets.close' => 'Tickets schließen',
            ],
            'email' => [
                'email.view' => 'E-Mail anzeigen',
                'email.send' => 'E-Mail senden',
                'email.reply' => 'Antworten',
                'email.delete' => 'E-Mail löschen',
                'email.link' => 'Verknüpfen',
            ],
            'users' => [
                'users.view' => 'Benutzer anzeigen',
                'users.create' => 'Benutzer erstellen',
                'users.edit' => 'Benutzer bearbeiten',
                'users.delete' => 'Benutzer löschen',
                'users.invite' => 'Benutzer einladen',
                'users.deactivate' => 'Benutzer deaktivieren',
            ],
            'roles' => [
                'roles.view' => 'Rollen anzeigen',
                'roles.create' => 'Rollen erstellen',
                'roles.edit' => 'Rollen bearbeiten',
                'roles.delete' => 'Rollen löschen',
            ],
            'permissions' => [
                'permissions.view' => 'Berechtigungen anzeigen',
                'permissions.manage' => 'Berechtigungen verwalten',
            ],
            'labels' => [
                'labels.view' => 'Labels anzeigen',
                'labels.create' => 'Labels erstellen',
                'labels.edit' => 'Labels bearbeiten',
                'labels.delete' => 'Labels löschen',
            ],
            'settings' => [
                'settings.view' => 'Einstellungen anzeigen',
                'settings.edit' => 'Einstellungen bearbeiten',
            ],
            'integrations' => [
                'integrations.view' => 'Integrationen anzeigen',
                'integrations.manage' => 'Integrationen verwalten',
            ],
            'audit_logs' => [
                'audit_logs.view' => 'Audit-Logs anzeigen',
            ],
            'system' => [
                'database.access' => 'Datenbankzugriff',
            ],
        ];
    }

    /**
     * Check if user has permission
     */
    public static function hasPermission(User $user, string $permission): bool
    {
        // Owner (admin) has all permissions
        if ($user->role === 'owner' || $user->role === 'admin') {
            return true;
        }

        // Get role permissions from Supabase or use default
        $rolePermissions = self::getRolePermissions($user->role);

        // Check if permission exists in role
        if (isset($rolePermissions[$permission]) && $rolePermissions[$permission]) {
            return true;
        }

        // Check individual overrides
        $overrides = self::getUserPermissionOverrides($user->id);
        if (isset($overrides[$permission])) {
            return $overrides[$permission];
        }

        return false;
    }

    /**
     * Get permissions for a role (from database + defaults)
     */
    public static function getRolePermissions(string $role): array
    {
        // Try to get from cache first
        $cacheKey = 'role_permissions_' . $role;
        if (cache()->has($cacheKey)) {
            return cache()->get($cacheKey);
        }

        $allPermissions = self::getAllPermissions();
        $permissions = [];

        foreach ($allPermissions as $module => $perms) {
            foreach ($perms as $key => $label) {
                $permissions[$key] = false;
            }
        }

        // Get default role permissions
        $roleDefaults = [
            'owner' => array_fill_keys(array_keys($permissions), true),
            'admin' => array_fill_keys(array_keys($permissions), true),
            'manager' => [
                'dashboard.view' => true,
                'crm.view' => true, 'crm.create' => true, 'crm.edit' => true, 'crm.export' => true,
                'leads.view' => true, 'leads.create' => true, 'leads.edit' => true, 'leads.convert' => true,
                'projects.view' => true, 'projects.create' => true, 'projects.edit' => true, 'projects.assign' => true,
                'tasks.view' => true, 'tasks.create' => true, 'tasks.edit' => true, 'tasks.assign' => true, 'tasks.delete' => true,
                'calendar.view' => true, 'calendar.create' => true, 'calendar.edit' => true, 'calendar.delete' => true,
                'finances.view' => true,
                'invoices.view' => true, 'invoices.create' => true, 'invoices.edit' => true, 'invoices.send' => true, 'invoices.export' => true,
                'quotes.view' => true, 'quotes.create' => true, 'quotes.edit' => true, 'quotes.export' => true,
                'time_tracking.view' => true, 'time_tracking.create' => true, 'time_tracking.edit' => true, 'time_tracking.approve' => true,
                'team.view' => true, 'team.edit' => true,
                'leave.view' => true, 'leave.create' => true, 'leave.approve' => true,
                'notes.view' => true, 'notes.create' => true, 'notes.edit' => true, 'notes.delete' => true,
                'inventory.view' => true, 'inventory.create' => true, 'inventory.edit' => true, 'inventory.export' => true,
                'wms.view' => true, 'wms.create' => true,
                'barcode.view' => true, 'barcode.create' => true, 'barcode.scan' => true, 'barcode.print' => true,
                'statistics.view' => true,
                'tickets.view' => true, 'tickets.create' => true, 'tickets.edit' => true, 'tickets.assign' => true,
                'email.view' => true, 'email.send' => true,
                'users.view' => true,
                'roles.view' => true,
                'labels.view' => true, 'labels.create' => true, 'labels.edit' => true,
                'audit_logs.view' => true,
                'settings.view' => true,
                'integrations.view' => true,
            ],
            'employee' => [
                'dashboard.view' => true,
                'crm.view' => true,
                'leads.view' => true,
                'projects.view' => true, 'projects.create' => true,
                'tasks.view' => true, 'tasks.create' => true, 'tasks.edit' => true,
                'calendar.view' => true, 'calendar.create' => true,
                'finances.view' => true,
                'invoices.view' => true,
                'quotes.view' => true,
                'time_tracking.view' => true, 'time_tracking.create' => true,
                'team.view' => true,
                'leave.view' => true, 'leave.create' => true,
                'notes.view' => true, 'notes.create' => true, 'notes.edit' => true,
                'inventory.view' => true,
                'wms.view' => true,
                'barcode.view' => true, 'barcode.scan' => true,
                'tickets.view' => true, 'tickets.create' => true,
                'email.view' => true,
            ],
            'support' => [
                'dashboard.view' => true,
                'crm.view' => true,
                'tickets.view' => true, 'tickets.create' => true, 'tickets.edit' => true, 'tickets.assign' => true, 'tickets.close' => true,
                'email.view' => true, 'email.send' => true, 'email.reply' => true,
                'projects.view' => true,
                'tasks.view' => true, 'tasks.create' => true, 'tasks.edit' => true,
                'calendar.view' => true, 'calendar.create' => true,
                'time_tracking.view' => true, 'time_tracking.create' => true,
                'team.view' => true,
                'leave.view' => true, 'leave.create' => true,
                'notes.view' => true, 'notes.create' => true,
            ],
            'finance' => [
                'dashboard.view' => true,
                'crm.view' => true, 'crm.export' => true,
                'finances.view' => true, 'finances.create' => true, 'finances.edit' => true, 'finances.export' => true,
                'invoices.view' => true, 'invoices.create' => true, 'invoices.edit' => true, 'invoices.send' => true, 'invoices.export' => true, 'invoices.mark_paid' => true,
                'quotes.view' => true, 'quotes.create' => true, 'quotes.edit' => true, 'quotes.export' => true,
                'projects.view' => true,
                'time_tracking.view' => true, 'time_tracking.approve' => true,
                'team.view' => true,
                'leave.view' => true, 'leave.create' => true,
                'notes.view' => true, 'notes.create' => true,
                'statistics.view' => true, 'statistics.export' => true,
                'calendar.view' => true,
                'inventory.view' => true, 'inventory.export' => true,
            ],
            'sales' => [
                'dashboard.view' => true,
                'crm.view' => true, 'crm.create' => true, 'crm.edit' => true, 'crm.export' => true,
                'leads.view' => true, 'leads.create' => true, 'leads.edit' => true, 'leads.convert' => true, 'leads.export' => true,
                'invoices.view' => true, 'invoices.create' => true, 'invoices.edit' => true, 'invoices.send' => true, 'invoices.export' => true,
                'quotes.view' => true, 'quotes.create' => true, 'quotes.edit' => true, 'quotes.export' => true,
                'finances.view' => true,
                'projects.view' => true, 'projects.create' => true,
                'tasks.view' => true, 'tasks.create' => true,
                'calendar.view' => true, 'calendar.create' => true,
                'time_tracking.view' => true, 'time_tracking.create' => true,
                'team.view' => true,
                'leave.view' => true, 'leave.create' => true,
                'notes.view' => true, 'notes.create' => true,
                'email.view' => true, 'email.send' => true,
                'statistics.view' => true,
            ],
            'guest' => [
                'dashboard.view' => true,
            ],
        ];

        // Start with defaults
        $result = $roleDefaults[$role] ?? $permissions;

        // Override with database values if they exist
        try {
            $dbPermissions = RolePermission::where('role', $role)->get();
            foreach ($dbPermissions as $perm) {
                $result[$perm->permission] = $perm->allowed;
            }
        } catch (\Exception $e) {
            // Table might not exist yet, use defaults
        }

        // Cache for 5 minutes
        cache()->put($cacheKey, $result, 300);

        return $result;
    }

    /**
     * Get user permission overrides (individual)
     */
    public static function getUserPermissionOverrides(int $userId): array
    {
        // This would normally query the user_permissions table
        // For now, return empty - can be extended later
        return [];
    }

    /**
     * Get all available roles
     */
    public static function getRoles(): array
    {
        return [
            'owner' => 'Inhaber',
            'admin' => 'Administrator',
            'manager' => 'Manager',
            'employee' => 'Mitarbeiter',
            'support' => 'Support',
            'finance' => 'Finanzen',
            'sales' => 'Vertrieb',
            'guest' => 'Gast',
        ];
    }

    /**
     * Check if user can access a module
     */
    public static function canAccessModule(User $user, string $module): bool
    {
        $modulePermissions = [
            'dashboard' => 'dashboard.view',
            'crm' => 'crm.view',
            'leads' => 'leads.view',
            'projects' => 'projects.view',
            'tasks' => 'tasks.view',
            'calendar' => 'calendar.view',
            'finances' => 'finances.view',
            'invoices' => 'invoices.view',
            'quotes' => 'quotes.view',
            'time_tracking' => 'time_tracking.view',
            'team' => 'team.view',
            'leave' => 'leave.view',
            'notes' => 'notes.view',
            'inventory' => 'inventory.view',
            'wms' => 'wms.view',
            'barcode' => 'barcode.view',
            'statistics' => 'statistics.view',
            'tickets' => 'tickets.view',
            'email' => 'email.view',
            'users' => 'users.view',
            'roles' => 'roles.view',
            'permissions' => 'permissions.view',
            'labels' => 'labels.view',
            'settings' => 'settings.view',
            'audit_logs' => 'audit_logs.view',
            'database' => 'database.access',
        ];

        $permission = $modulePermissions[$module] ?? null;
        if (!$permission) return false;

        return self::hasPermission($user, $permission);
    }
}
