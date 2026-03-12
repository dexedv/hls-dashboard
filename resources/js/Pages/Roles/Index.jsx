import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function RolesIndex({ roles, permissions, rolePermissions }) {
    const { auth } = usePage().props;
    const [selectedRole, setSelectedRole] = useState('manager');
    const [saving, setSaving] = useState(false);
    const [localPermissions, setLocalPermissions] = useState(rolePermissions);

    const roleColors = {
        owner: 'bg-purple-100 text-purple-800 border-purple-200',
        admin: 'bg-red-100 text-red-800 border-red-200',
        manager: 'bg-blue-100 text-blue-800 border-blue-200',
        employee: 'bg-green-100 text-green-800 border-green-200',
        guest: 'bg-gray-100 text-gray-800 border-gray-200',
        support: 'bg-orange-100 text-orange-800 border-orange-200',
        finance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        sales: 'bg-pink-100 text-pink-800 border-pink-200',
    };

    const handleToggle = (permission) => {
        setLocalPermissions(prev => ({
            ...prev,
            [selectedRole]: {
                ...prev[selectedRole],
                [permission]: !prev[selectedRole]?.[permission]
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/roles/permissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    role: selectedRole,
                    permissions: localPermissions[selectedRole]
                })
            });

            if (response.ok) {
                alert('Berechtigungen gespeichert!');
                window.location.reload();
            } else {
                alert('Fehler beim Speichern');
            }
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
        setSaving(false);
    };

    const handleReset = async () => {
        if (!confirm('Möchten Sie diese Rolle wirklich auf die Standardwerte zurücksetzen?')) {
            return;
        }

        setSaving(true);
        try {
            const response = await fetch('/roles/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ role: selectedRole })
            });

            if (response.ok) {
                alert('Rolle zurückgesetzt!');
                window.location.reload();
            }
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
        setSaving(false);
    };

    // Group permissions by module
    const modules = Object.entries(permissions);

    return (
        <DashboardLayout title="Rollen & Berechtigungen">
            <Head title="Rollen & Berechtigungen" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Rollen & Berechtigungen</h1>
                <p className="text-sm text-gray-500 mt-1">Verwalten Sie Rollen und weisen Sie Berechtigungen zu</p>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {Object.entries(roles).map(([slug, name]) => (
                    <button
                        key={slug}
                        onClick={() => setSelectedRole(slug)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedRole === slug
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-lg font-semibold">{name}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${roleColors[slug] || 'bg-gray-100'}`}>
                                {slug}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">
                            {Object.values(localPermissions[slug] || {}).filter(Boolean).length} Berechtigungen
                        </p>
                    </button>
                ))}
            </div>

            {/* Permission Editor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Berechtigungen für: {roles[selectedRole]}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Klicken Sie auf die Berechtigungen, um sie zu aktivieren/deaktivieren
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Zurücksetzen
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                            {saving ? 'Speichern...' : 'Speichern'}
                        </button>
                    </div>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {modules.map(([module, modulePermissions]) => (
                        <div key={module} className="mb-6 last:mb-0">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3 pb-2 border-b border-gray-100">
                                {module}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {Object.entries(modulePermissions).map(([key, label]) => (
                                    <label
                                        key={key}
                                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                            localPermissions[selectedRole]?.[key]
                                                ? 'bg-green-50 hover:bg-green-100'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={localPermissions[selectedRole]?.[key] || false}
                                            onChange={() => handleToggle(key)}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className={`text-sm ${
                                            localPermissions[selectedRole]?.[key]
                                                ? 'text-green-700 font-medium'
                                                : 'text-gray-600'
                                        }`}>
                                            {label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Hinweis zu Rollen</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Owner/Inhaber</strong> - Hat alle Berechtigungen, kann nicht gelöscht werden</li>
                    <li>• <strong>Admin</strong> - Volle Administrationsrechte</li>
                    <li>• <strong>Manager</strong> - Projekt- und Teamverwaltung</li>
                    <li>• <strong>Employee/Mitarbeiter</strong> - Standard-Zugriff für Mitarbeiter</li>
                    <li>• <strong>Guest/Gast</strong> - Eingeschränkter Zugriff</li>
                </ul>
            </div>
        </DashboardLayout>
    );
}
