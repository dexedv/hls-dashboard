import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function PermissionsIndex({ roles, permissions, rolePermissions }) {
    const { auth } = usePage().props;
    const userPermissions = auth?.permissions || {};

    // Check if user can manage permissions
    const canManage = userPermissions['permissions.manage'];

    const getPermissionGroups = () => {
        const groups = {};
        Object.entries(permissions).forEach(([module, perms]) => {
            groups[module] = Object.entries(perms).map(([key, label]) => ({ key, label }));
        });
        return groups;
    };

    const permissionGroups = getPermissionGroups();

    return (
        <DashboardLayout title="Berechtigungen">
            <Head title="Berechtigungen" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Berechtigungen</h1>
                <p className="text-sm text-gray-500 mt-1">Verwalten Sie Rollen und Berechtigungen</p>
            </div>

            {/* Permission Matrix */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-64">
                                    Berechtigung
                                </th>
                                {Object.entries(roles).map(([slug, name]) => (
                                    <th key={slug} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        {name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {Object.entries(permissionGroups).map(([module, perms]) => (
                                <>
                                    <tr key={module} className="bg-gray-100">
                                        <td colSpan={Object.keys(roles).length + 1} className="px-6 py-2">
                                            <span className="text-sm font-semibold text-gray-700 uppercase">
                                                {module === 'crm' && 'CRM / Kunden'}
                                                {module === 'leads' && 'Leads'}
                                                {module === 'projects' && 'Projekte'}
                                                {module === 'tasks' && 'Aufgaben'}
                                                {module === 'calendar' && 'Kalender'}
                                                {module === 'finances' && 'Finanzen'}
                                                {module === 'invoices' && 'Rechnungen'}
                                                {module === 'time_tracking' && 'Zeiterfassung'}
                                                {module === 'team' && 'Team'}
                                                {module === 'leave' && 'Urlaub'}
                                                {module === 'notes' && 'Notizen'}
                                                {module === 'inventory' && 'Inventar'}
                                                {module === 'wms' && 'Warenwirtschaft'}
                                                {module === 'barcode' && 'Barcode'}
                                                {module === 'statistics' && 'Statistiken'}
                                                {module === 'tickets' && 'Tickets'}
                                                {module === 'email' && 'E-Mail'}
                                                {module === 'users' && 'Benutzer'}
                                                {module === 'roles' && 'Rollen'}
                                                {module === 'labels' && 'Labels'}
                                                {module === 'settings' && 'Einstellungen'}
                                                {module === 'integrations' && 'Integrationen'}
                                                {module === 'audit_logs' && 'Audit Logs'}
                                                {module === 'system' && 'System'}
                                                {module === 'dashboard' && 'Dashboard'}
                                            </span>
                                        </td>
                                    </tr>
                                    {perms.map((perm) => (
                                        <tr key={perm.key} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-sm text-gray-900">
                                                {perm.label}
                                            </td>
                                            {Object.entries(roles).map(([slug, name]) => (
                                                <td key={slug} className="px-4 py-3 text-center">
                                                    {rolePermissions[slug]?.[perm.key] ? (
                                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
                                                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Über Berechtigungen</h3>
                <p className="text-sm text-blue-800">
                    Berechtigungen werden über Rollen verwaltet. Jede Rolle hat Standardberechtigungen,
                    die individuell angepasst werden können.
                </p>
                <ul className="mt-3 text-sm text-blue-800 space-y-1">
                    <li>• Rollen definieren die Basis-Berechtigungen</li>
                    <li>• Benutzer können individuelle overrides erhalten</li>
                    <li>• Kritische Rechte sind farblich hervorgehoben</li>
                </ul>
            </div>
        </DashboardLayout>
    );
}
