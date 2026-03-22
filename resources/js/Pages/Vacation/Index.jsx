import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

export default function VacationIndex({ leaveRequests, statuses = [] }) {
    const { auth } = usePage().props;
    const permissions = auth.permissions || {};
    const canApprove = permissions['leave.approve'];

    const [showModal, setShowModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, processing, reset } = useForm({
        type: 'vacation',
        start_date: '',
        end_date: '',
        notes: '',
    });

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

    const handleApprove = (id) => {
        if (!confirm('Urlaubsantrag genehmigen?')) return;
        router.post(route('vacation.approve', id));
    };

    const openRejectModal = (id) => {
        setRejectingId(id);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const handleReject = (e) => {
        e.preventDefault();
        router.post(route('vacation.reject', rejectingId), {
            rejection_reason: rejectionReason,
        }, {
            onSuccess: () => {
                setShowRejectModal(false);
                setRejectingId(null);
                setRejectionReason('');
            }
        });
    };

    const filteredRequests = leaveRequests.data.filter(request =>
        request.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        typeLabels[request.type]?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <DashboardLayout title="Urlaub">
            <Head title="Urlaub" />
            <PageHeader
                title="Urlaubsverwaltung"
                subtitle="Verwalten Sie Urlaubsantraege"
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
                        placeholder="Urlaubsantraege suchen..."
                    />
                </div>
            </PageHeader>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {filteredRequests.length === 0 ? (
                    <div className="px-6 py-12">
                        <EmptyState
                            title="Noch keine Urlaubsantraege vorhanden"
                            description="Stellen Sie Ihren ersten Urlaubsantrag."
                            onAction={() => setShowModal(true)}
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Mitarbeiter</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Art</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Zeitraum</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tage</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredRequests.map((request) => {
                                        const statusInfo = getStatusInfo(request.status);
                                        const isPending = request.status === 'pending';
                                        return (
                                            <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{request.user?.name}</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                    {typeLabels[request.type] || request.type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                    {formatDate(request.start_date)} - {formatDate(request.end_date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                    {request.days}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {canApprove && isPending && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(request.id)}
                                                                    className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                                                                >
                                                                    Genehmigen
                                                                </button>
                                                                <button
                                                                    onClick={() => openRejectModal(request.id)}
                                                                    className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                                                >
                                                                    Ablehnen
                                                                </button>
                                                            </>
                                                        )}
                                                        <Link
                                                            href={route('vacation.show', request.id)}
                                                            className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                                                            title="Details"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredRequests.map((request) => {
                                const statusInfo = getStatusInfo(request.status);
                                const isPending = request.status === 'pending';
                                return (
                                    <div key={request.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{request.user?.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{typeLabels[request.type] || request.type} - {request.days} Tag(e)</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(request.start_date)} - {formatDate(request.end_date)}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                        {canApprove && isPending && (
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(request.id)}
                                                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors text-center"
                                                >
                                                    Genehmigen
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(request.id)}
                                                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors text-center"
                                                >
                                                    Ablehnen
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                <Pagination links={leaveRequests.links} from={leaveRequests.from} to={leaveRequests.to} total={leaveRequests.total} entityName="Antraege" />
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h2 className="text-xl font-semibold dark:text-gray-100">Neuer Urlaubsantrag</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urlaubsart</label>
                                <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                    <option value="vacation">Urlaub</option>
                                    <option value="sick">Krankheit</option>
                                    <option value="other">Sonstiges</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Von *</label>
                                    <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bis *</label>
                                    <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notizen</label>
                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2} className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setShowModal(false)}>Abbrechen</Button>
                                <Button type="submit" disabled={processing}>Speichern</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Antrag ablehnen</h2>
                            <IconButton onClick={() => setShowRejectModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleReject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ablehnungsgrund *</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="Bitte geben Sie einen Grund an..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Abbrechen</Button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                                >
                                    Ablehnen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
