import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function TimeTrackingIndex({ timeEntries, totalDuration, projects }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        project_id: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
    });

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('time-tracking.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };

    return (
        <DashboardLayout title="Zeiterfassung">
            <Head title="Zeiterfassung" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Zeiterfassung</h1>
                    <p className="text-sm text-gray-500 mt-1">Erfassen Sie Ihre Arbeitszeit</p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Neue Zeit
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-sm font-medium text-gray-500">Gesamtzeit</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{formatDuration(totalDuration || 0)}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                {timeEntries.data.length === 0 ? (
                    <div className="p-12 text-center text-gray-500"><p>Noch keine Zeiteinträge vorhanden</p></div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {timeEntries.data.map((entry) => (
                            <div key={entry.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">{entry.description || 'Keine Beschreibung'}</p>
                                    <p className="text-sm text-gray-500">{entry.project?.name || 'Kein Projekt'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">{formatDuration(entry.duration || 0)}</p>
                                    <p className="text-sm text-gray-500">{entry.start_time ? new Date(entry.start_time).toLocaleDateString('de-DE') : '-'}</p>
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
                            <h2 className="text-xl font-semibold">Neue Zeit erfassen</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Datum *</label>
                                <input type="date" value={data.date} onChange={e => setData('date', e.target.value)} className="w-full border rounded-lg px-4 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                                <select value={data.project_id} onChange={e => setData('project_id', e.target.value)} className="w-full border rounded-lg px-4 py-2">
                                    <option value="">Kein Projekt</option>
                                    {projects?.data?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Startzeit</label>
                                    <input type="time" value={data.start_time} onChange={e => setData('start_time', e.target.value)} className="w-full border rounded-lg px-4 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Endzeit</label>
                                    <input type="time" value={data.end_time} onChange={e => setData('end_time', e.target.value)} className="w-full border rounded-lg px-4 py-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2} className="w-full border rounded-lg px-4 py-2" />
                            </div>
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
