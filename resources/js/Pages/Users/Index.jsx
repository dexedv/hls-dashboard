import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function UsersIndex({ users }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        permissions: {},
    });

    const openEditModal = (user) => {
        setSelectedUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role || 'employee',
            permissions: user.permissions || {},
        });
        setActiveTab('details');
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('users.update', selectedUser.id), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };

    const roleLabels = {
        owner: 'Eigentümer',
        admin: 'Administrator',
        manager: 'Manager',
        employee: 'Mitarbeiter',
        viewer: 'Betrachter',
    };

    const allPermissions = [
        { key: 'dashboard.view', label: 'Dashboard anzeigen' },
        { key: 'crm.view', label: 'Kunden anzeigen' },
        { key: 'crm.create', label: 'Kunden erstellen' },
        { key: 'crm.edit', label: 'Kunden bearbeiten' },
        { key: 'crm.delete', label: 'Kunden löschen' },
        { key: 'leads.view', label: 'Leads anzeigen' },
        { key: 'leads.create', label: 'Leads erstellen' },
        { key: 'leads.edit', label: 'Leads bearbeiten' },
        { key: 'projects.view', label: 'Projekte anzeigen' },
        { key: 'projects.create', label: 'Projekte erstellen' },
        { key: 'projects.edit', label: 'Projekte bearbeiten' },
        { key: 'tasks.view', label: 'Aufgaben anzeigen' },
        { key: 'tasks.create', label: 'Aufgaben erstellen' },
        { key: 'tasks.edit', label: 'Aufgaben bearbeiten' },
        { key: 'invoices.view', label: 'Rechnungen anzeigen' },
        { key: 'invoices.create', label: 'Rechnungen erstellen' },
        { key: 'team.view', label: 'Team anzeigen' },
        { key: 'team.create', label: 'Team-Mitglieder erstellen' },
        { key: 'team.edit', label: 'Team-Mitglieder bearbeiten' },
        { key: 'leave.view', label: 'Urlaub anzeigen' },
        { key: 'leave.approve', label: 'Urlaub genehmigen' },
        { key: 'inventory.view', label: 'Inventar anzeigen' },
        { key: 'inventory.create', label: 'Inventar erstellen' },
        { key: 'users.view', label: 'Benutzer anzeigen' },
        { key: 'users.manage', label: 'Benutzer verwalten' },
        { key: 'roles.view', label: 'Rollen anzeigen' },
        { key: 'roles.manage', label: 'Rollen verwalten' },
        { key: 'permissions.manage', label: 'Berechtigungen verwalten' },
        { key: 'settings.view', label: 'Einstellungen anzeigen' },
        { key: 'settings.manage', label: 'Einstellungen verwalten' },
    ];

    return (
        <DashboardLayout title="Benutzer">
            <Head title="Benutzer" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Benutzer</h1>
                <p className="text-sm text-gray-500 mt-1">Benutzerverwaltung und Berechtigungen</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-Mail</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rolle</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users && users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                            {roleLabels[user.role] || user.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                        >
                                            Bearbeiten
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                    Keine Benutzer vorhanden
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">Benutzer bearbeiten: {selectedUser.name}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`px-6 py-3 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
                            >
                                Details
                            </button>
                            <button
                                onClick={() => setActiveTab('permissions')}
                                className={`px-6 py-3 text-sm font-medium ${activeTab === 'permissions' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
                            >
                                Berechtigungen
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            {activeTab === 'details' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded-lg px-4 py-2" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border rounded-lg px-4 py-2" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort</label>
                                        <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border rounded-lg px-4 py-2" placeholder="Leer lassen für kein neues Passwort" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
                                        <select value={data.role} onChange={e => setData('role', e.target.value)} className="w-full border rounded-lg px-4 py-2">
                                            <option value="employee">Mitarbeiter</option>
                                            <option value="manager">Manager</option>
                                            <option value="admin">Administrator</option>
                                            <option value="viewer">Betrachter</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'permissions' && (
                                <div className="space-y-4">
                                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Hinweis:</strong> Individuelle Berechtigungen überschreiben die Rollen-Berechtigungen.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                                        {allPermissions.map((perm) => (
                                            <label key={perm.key} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={data.permissions[perm.key] === true}
                                                    onChange={(e) => setData('permissions', { ...data.permissions, [perm.key]: e.target.checked })}
                                                    className="rounded border-gray-300"
                                                />
                                                <span className="text-sm text-gray-700">{perm.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Abbrechen</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Speichern</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
