import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function VacationIndex({ leaveRequests }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        leave_type: 'vacation',
        start_date: '',
        end_date: '',
        notes: '',
    });

    const statusColors = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' };
    const statusLabels = { pending: 'Ausstehend', approved: 'Genehmigt', rejected: 'Abgelehnt' };
    const typeLabels = { vacation: 'Urlaub', sick: 'Krankheit', other: 'Sonstiges' };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('vacation.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };

    return (
        <DashboardLayout title="Urlaub">
            <Head title="Urlaub" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Urlaubsverwaltung</h1>
                    <p className="text-sm text-gray-500 mt-1">Verwalten Sie Urlaubsanträge</p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Neuer Antrag
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                {leaveRequests.data.length === 0 ? (
                    <div className="p-12 text-center text-gray-500"><p>Noch keine Urlaubsanträge vorhanden</p></div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {leaveRequests.data.map((request) => (
                            <div key={request.id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-900">{request.user?.name}</p>
                                        <p className="text-sm text-gray-500">{typeLabels[request.type] || request.type} • {request.days} Tag(e)</p>
                                        <p className="text-sm text-gray-500">{request.start_date} - {request.end_date}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[request.status]}`}>{statusLabels[request.status] || request.status}</span>
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
                            <h2 className="text-xl font-semibold">Neuer Urlaubsantrag</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Urlaubsart</label>
                                <select value={data.leave_type} onChange={e => setData('leave_type', e.target.value)} className="w-full border rounded-lg px-4 py-2">
                                    <option value="vacation">Urlaub</option>
                                    <option value="sick">Krankheit</option>
                                    <option value="other">Sonstiges</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Von *</label>
                                    <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="w-full border rounded-lg px-4 py-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bis *</label>
                                    <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="w-full border rounded-lg px-4 py-2" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2} className="w-full border rounded-lg px-4 py-2" />
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
