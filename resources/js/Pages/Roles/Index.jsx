import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader, { Button } from '@/Components/PageHeader';

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

    const handleSave = () => {
        setSaving(true);
        router.post('/roles/permissions', {
            role: selectedRole,
            permissions: localPermissions[selectedRole]
        });
    };

    const handleReset = () => {
        if (!confirm('Moechten Sie diese Rolle wirklich auf die Standardwerte zuruecksetzen?')) {
            return;
        }

        setSaving(true);
        router.post('/roles/reset', {
            role: selectedRole
        });
    };

    // Group permissions by module
    const modules = Object.entries(permissions);

    return (
        <DashboardLayout title="Rollen & Berechtigungen">
            <Head title="Rollen & Berechtigungen" />

            <PageHeader
                title="Rollen & Berechtigungen"
                subtitle="Verwalten Sie Rollen und weisen Sie Berechtigungen zu"
            />

            {/* Role Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {Object.entries(roles).map(([slug, name]) => (
                    <button
                        key={slug}
                        onClick={() => setSelectedRole(slug)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            selectedRole === slug
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-lg font-semibold text-gray-900">{name}</span>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Berechtigungen fuer: {roles[selectedRole]}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Klicken Sie auf die Berechtigungen, um sie zu aktivieren/deaktivieren
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={handleReset}
                            disabled={saving}
                        >
                            Zuruecksetzen
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Speichern...' : 'Speichern'}
                        </Button>
                    </div>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {modules.map(([module, modulePermissions]) => (
                        <div key={module} className="mb-6 last:mb-0">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3 pb-2 border-b border-gray-100">
                                {module}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {Object.entries(modulePermissions).map(([key, label]) => (
                                    <label
                                        key={key}
                                        className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
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
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-blue-900">Hinweis zu Rollen</h3>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>- <strong>Owner/Inhaber</strong> - Hat alle Berechtigungen, kann nicht geloescht werden</li>
                    <li>- <strong>Admin</strong> - Volle Administrationsrechte</li>
                    <li>- <strong>Manager</strong> - Projekt- und Teamverwaltung</li>
                    <li>- <strong>Employee/Mitarbeiter</strong> - Standard-Zugriff fuer Mitarbeiter</li>
                    <li>- <strong>Guest/Gast</strong> - Eingeschraenkter Zugriff</li>
                </ul>
            </div>
        </DashboardLayout>
    );
}
