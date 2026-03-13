import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import Modal from '@/Components/Modal';

export default function UsersIndex({ users }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [searchQuery, setSearchQuery] = useState('');

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

    // Filter users based on search query
    const filteredUsers = users?.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roleLabels[user.role]?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <DashboardLayout title="Benutzer">
            <Head title="Benutzer" />

            <PageHeader
                title="Benutzer"
                subtitle="Benutzerverwaltung und Berechtigungen"
            >
                <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Benutzer suchen..."
                    className="w-64"
                />
            </PageHeader>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredUsers.length > 0 ? (
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
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                            {roleLabels[user.role] || user.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <Button
                                            variant="secondary"
                                            onClick={() => openEditModal(user)}
                                            className="text-sm"
                                        >
                                            Bearbeiten
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <EmptyState
                        title="Keine Benutzer vorhanden"
                        description={searchQuery ? "Keine Benutzer entsprechen Ihrer Suche." : "Erstellen Sie Ihren ersten Benutzer, um zu beginnen."}
                        action={false}
                    />
                )}
            </div>

            {/* Edit Modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Benutzer bearbeiten: {selectedUser?.name}</h2>
                            <p className="text-sm text-gray-500 mt-1">Passen Sie die Benutzerdetails und Berechtigungen an</p>
                        </div>
                        <IconButton onClick={() => setShowModal(false)}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </IconButton>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'details'
                                    ? 'border-b-2 border-primary-600 text-primary-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab('permissions')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'permissions'
                                    ? 'border-b-2 border-primary-600 text-primary-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Berechtigungen
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {activeTab === 'details' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        placeholder="Leer lassen für kein neues Passwort"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
                                    <select
                                        value={data.role}
                                        onChange={e => setData('role', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    >
                                        <option value="owner">Inhaber</option>
                                        <option value="admin">Administrator</option>
                                        <option value="manager">Manager</option>
                                        <option value="employee">Mitarbeiter</option>
                                        <option value="support">Support</option>
                                        <option value="finance">Finanzen</option>
                                        <option value="sales">Vertrieb</option>
                                        <option value="guest">Gast</option>
                                        <option value="viewer">Betrachter</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'permissions' && (
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Hinweis:</strong> Individuelle Berechtigungen überschreiben die Rollen-Berechtigungen.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                                    {allPermissions.map((perm) => (
                                        <label key={perm.key} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={data.permissions[perm.key] === true}
                                                onChange={(e) => setData('permissions', { ...data.permissions, [perm.key]: e.target.checked })}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-gray-700">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                                Abbrechen
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Speichern
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
