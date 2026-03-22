import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';

export default function TeamIndex({ users, labels }) {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        const url = new URL(route('team.index'));
        if (search) url.searchParams.set('search', search);
        router.visit(url.toString());
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'employee',
        labels: [],
    });

    const roleLabels = { admin: 'Administrator', manager: 'Manager', employee: 'Mitarbeiter', viewer: 'Betrachter' };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('team.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };

    return (
        <DashboardLayout title="Team">
            <Head title="Team" />

            {/* Page Header */}
            <PageHeader
                title="Team"
                subtitle="Verwalten Sie Ihre Teammitglieder"
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Neuer Mitarbeiter
                    </Button>
                }
            >
                <div className="mt-4">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        onSubmit={handleSearch}
                        placeholder="Teammitglieder suchen..."
                    />
                </div>
            </PageHeader>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                {users.data.length === 0 ? (
                    <EmptyState
                        title="Noch keine Teammitglieder vorhanden"
                        description="Fügen Sie Ihr erstes Teammitglied hinzu."
                        actionLabel="Teammitglied hinzufügen"
                        onAction={() => setShowModal(true)}
                    />
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {users.data.map((user) => (
                            <div key={user.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                        <span className="text-primary-600 font-medium">{user.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {user.labels && user.labels.length > 0 && (
                                        <div className="flex gap-1 mr-2">
                                            {user.labels.map((label) => (
                                                <span
                                                    key={label?.id}
                                                    className="px-2 py-0.5 text-xs rounded-full"
                                                    style={{ backgroundColor: (label?.color || '#6b7280') + '20', color: label?.color || '#6b7280' }}
                                                >
                                                    {label?.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{roleLabels[user.role] || user.role}</span>
                                    <Link href={route('team.edit', user.id)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Neuer Mitarbeiter</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passwort *</label>
                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required minLength={8} />
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
                                <select value={data.role} onChange={e => setData('role', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                    <option value="employee">Mitarbeiter</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Administrator</option>
                                    <option value="viewer">Betrachter</option>
                                    <option value="support">Support</option>
                                    <option value="finance">Finanzen</option>
                                    <option value="sales">Vertrieb</option>
                                    <option value="guest">Gast</option>
                                </select>
                            </div>
                            {labels && labels.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
                                    <div className="flex flex-wrap gap-2">
                                        {labels.map((label) => (
                                            <label key={label.id} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.labels.includes(label.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setData('labels', [...data.labels, label.id]);
                                                        } else {
                                                            setData('labels', data.labels.filter(id => id !== label.id));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300"
                                                />
                                                <span
                                                    className="px-2 py-0.5 text-xs rounded-full"
                                                    style={{ backgroundColor: label.color + '20', color: label.color }}
                                                >
                                                    {label.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setShowModal(false)}>Abbrechen</Button>
                                <Button disabled={processing}>Speichern</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
