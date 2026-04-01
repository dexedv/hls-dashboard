import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';

export default function Create() {
    const { users } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        type: 'vacation',
        user_id: '',
        start_date: '',
        end_date: '',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/vacation');
    };

    return (
        <DashboardLayout title="Neuer Urlaubsantrag">
            <Head title="Neuer Urlaubsantrag" />

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Neuer Urlaubsantrag</h1>
                        <p className="text-sm text-gray-500 mt-1">Stellen Sie einen neuen Urlaubsantrag</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/vacation"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Urlaubsart <span className="text-red-500">*</span></label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className={`w-full border ${errors.type ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            >
                                <option value="vacation">Urlaub</option>
                                <option value="sick">Krank</option>
                                <option value="other">Sonstige</option>
                            </select>
                            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiter</label>
                            <select
                                value={data.user_id}
                                onChange={(e) => setData('user_id', e.target.value)}
                                className={`w-full border ${errors.user_id ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            >
                                <option value="">Eigener Antrag</option>
                                {(users || []).map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Von <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className={`w-full border ${errors.start_date ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                required
                            />
                            {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bis <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                className={`w-full border ${errors.end_date ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                required
                            />
                            {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={4}
                                className={`w-full border ${errors.notes ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                placeholder="Optionale Notizen zum Urlaubsantrag..."
                            />
                            {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes}</p>}
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
