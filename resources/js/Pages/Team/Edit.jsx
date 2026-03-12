import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function TeamEdit({ user, labels }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        phone: user?.phone || '',
        role: user?.role || 'employee',
        labels: user?.labels?.map(l => l.id) || [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('team.update', user.id));
    };

    return (
        <DashboardLayout title="Mitarbeiter bearbeiten">
            <Head title="Mitarbeiter bearbeiten" />

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mitarbeiter bearbeiten</h1>
                        <p className="text-sm text-gray-500 mt-1">{user?.name}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/team"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Abbrechen
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                            {processing ? 'Speichern...' : 'Speichern'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Leer lassen für kein neues Passwort"
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="employee">Mitarbeiter</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Administrator</option>
                                <option value="viewer">Betrachter</option>
                            </select>
                        </div>
                    </div>

                    {labels && labels.length > 0 && (
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Labels</label>
                            <div className="flex flex-wrap gap-3">
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
                                            className="px-3 py-1 text-sm rounded-full"
                                            style={{ backgroundColor: label.color + '20', color: label.color }}
                                        >
                                            {label.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </DashboardLayout>
    );
}
