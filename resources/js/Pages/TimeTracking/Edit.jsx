import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';

const toDatetimeLocal = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function Edit() {
    const { timeEntry, projects, tasks, users } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        description: timeEntry.description || '',
        start_time:  toDatetimeLocal(timeEntry.start_time),
        end_time:    toDatetimeLocal(timeEntry.end_time),
        project_id:  timeEntry.project_id || '',
        task_id:     timeEntry.task_id || '',
        user_id:     timeEntry.user_id || '',
        billable:    timeEntry.billable ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('time-tracking.update', timeEntry.id));
    };

    return (
        <DashboardLayout title="Zeiteintrag bearbeiten">
            <Head title="Zeiteintrag bearbeiten" />

            <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Zeiteintrag bearbeiten</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {timeEntry.user?.name || 'Mitarbeiter'} · {timeEntry.project?.name || 'Kein Projekt'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={route('time-tracking.index')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                            Abbrechen
                        </Link>
                        <button type="submit" disabled={processing}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium">
                            {processing ? 'Speichern...' : 'Speichern'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
                    {/* Mitarbeiter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiter</label>
                        <select value={data.user_id} onChange={e => setData('user_id', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500">
                            <option value="">Eigene Zeit</option>
                            {(users || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Start */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Startzeit *</label>
                            <input type="datetime-local" value={data.start_time}
                                onChange={e => setData('start_time', e.target.value)}
                                className={`w-full border ${errors.start_time ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                required />
                            {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>}
                        </div>

                        {/* Ende */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Endzeit</label>
                            <input type="datetime-local" value={data.end_time}
                                onChange={e => setData('end_time', e.target.value)}
                                className={`w-full border ${errors.end_time ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`} />
                            {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>}
                        </div>

                        {/* Projekt */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                            <select value={data.project_id} onChange={e => setData('project_id', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500">
                                <option value="">Kein Projekt</option>
                                {(projects || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        {/* Aufgabe */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Aufgabe</label>
                            <select value={data.task_id} onChange={e => setData('task_id', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500">
                                <option value="">Keine Aufgabe</option>
                                {(tasks || []).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Beschreibung */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                        <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500" />
                    </div>

                    {/* Abrechenbar */}
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="billable" checked={data.billable}
                            onChange={e => setData('billable', e.target.checked)}
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                        <label htmlFor="billable" className="text-sm text-gray-700">Abrechenbar</label>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
