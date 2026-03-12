import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function TeamIndex({ users, labels }) {
    const [showModal, setShowModal] = useState(false);
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Team</h1>
                    <p className="text-sm text-gray-500 mt-1">Verwalten Sie Ihre Teammitglieder</p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Neuer Mitarbeiter
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                {users.data.length === 0 ? (
                    <div className="p-12 text-center text-gray-500"><p>Noch keine Teammitglieder vorhanden</p></div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {users.data.map((user) => (
                            <div key={user.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                        <span className="text-primary-600 font-medium">{user.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
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
                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{roleLabels[user.role] || user.role}</span>
                                    <Link href={route('team.edit', user.id)} className="p-2 text-gray-400 hover:text-gray-600">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">Neuer Mitarbeiter</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded-lg px-4 py-2" required />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border rounded-lg px-4 py-2" required />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passwort *</label>
                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border rounded-lg px-4 py-2" required minLength={8} />
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full border rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
                                <select value={data.role} onChange={e => setData('role', e.target.value)} className="w-full border rounded-lg px-4 py-2">
                                    <option value="employee">Mitarbeiter</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Administrator</option>
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
