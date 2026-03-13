import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';

export default function VacationIndex({ leaveRequests, statuses = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { data, setData, post, processing, reset } = useForm({
        leave_type: 'vacation',
        start_date: '',
        end_date: '',
        notes: '',
    });

    // Dynamic status lookup from props
    const getStatusInfo = (statusValue) => {
        const status = statuses.find(s => s.value === statusValue);
        return status ? { color: status.color, label: status.label } : { color: 'bg-gray-100 text-gray-800', label: statusValue };
    };

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

    const filteredRequests = leaveRequests.data.filter(request =>
        request.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        typeLabels[request.type]?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout title="Urlaub">
            <Head title="Urlaub" />
            <PageHeader
                title="Urlaubsverwaltung"
                subtitle="Verwalten Sie Urlaubsanträge"
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Neuer Antrag
                    </Button>
                }
            >
                <div className="mt-4">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Urlaubsanträge suchen..."
                    />
                </div>
            </PageHeader>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {filteredRequests.length === 0 ? (
                    <EmptyState
                        title="Noch keine Urlaubsanträge vorhanden"
                        description="Stellen Sie Ihren ersten Urlaubsantrag."
                        onAction={() => setShowModal(true)}
                    />
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredRequests.map((request) => (
                            <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-900">{request.user?.name}</p>
                                        <p className="text-sm text-gray-500">{typeLabels[request.type] || request.type} • {request.days} Tag(e)</p>
                                        <p className="text-sm text-gray-500">{request.start_date} - {request.end_date}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusInfo(request.status).color}`}>{getStatusInfo(request.status).label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">Neuer Urlaubsantrag</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Urlaubsart</label>
                                <select value={data.leave_type} onChange={e => setData('leave_type', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                    <option value="vacation">Urlaub</option>
                                    <option value="sick">Krankheit</option>
                                    <option value="other">Sonstiges</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Von *</label>
                                    <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bis *</label>
                                    <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setShowModal(false)}>Abbrechen</Button>
                                <Button type="submit" disabled={processing}>Speichern</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
