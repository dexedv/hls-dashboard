import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';

export default function VacationEdit() {
    const { leaveRequest } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        type: leaveRequest.type || 'vacation',
        start_date: leaveRequest.start_date?.substring(0, 10) || '',
        end_date: leaveRequest.end_date?.substring(0, 10) || '',
        notes: leaveRequest.notes || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('vacation.update', leaveRequest.id));
    };

    return (
        <DashboardLayout title="Urlaubsantrag bearbeiten">
            <Head title="Urlaubsantrag bearbeiten" />

            <form onSubmit={handleSubmit} className="max-w-lg">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Urlaubsantrag bearbeiten</h1>
                    <div className="flex gap-3">
                        <Link href="/vacation" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Abbrechen
                        </Link>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                            {processing ? 'Speichern...' : 'Speichern'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Art</label>
                        <select
                            value={data.type}
                            onChange={e => setData('type', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="vacation">Urlaub</option>
                            <option value="sick">Krank</option>
                            <option value="other">Sonstiges</option>
                        </select>
                        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Von</label>
                        <input
                            type="date"
                            value={data.start_date}
                            onChange={e => setData('start_date', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                            required
                        />
                        {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bis</label>
                        <input
                            type="date"
                            value={data.end_date}
                            onChange={e => setData('end_date', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                            required
                        />
                        {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Anmerkungen</label>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
