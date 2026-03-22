import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button, IconButton } from '@/Components/PageHeader';

export default function VacationShow({ leaveRequest }) {
    const { auth } = usePage().props;
    const permissions = auth.permissions || {};
    const canApprove = permissions['leave.approve'];
    const isPending = leaveRequest.status === 'pending';

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const typeLabels = { vacation: 'Urlaub', sick: 'Krankheit', other: 'Sonstiges' };
    const statusLabels = { pending: 'Ausstehend', approved: 'Genehmigt', rejected: 'Abgelehnt' };
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleApprove = () => {
        if (!confirm('Urlaubsantrag genehmigen?')) return;
        router.post(route('vacation.approve', leaveRequest.id));
    };

    const handleReject = (e) => {
        e.preventDefault();
        router.post(route('vacation.reject', leaveRequest.id), {
            rejection_reason: rejectionReason,
        }, {
            onSuccess: () => setShowRejectModal(false),
        });
    };

    return (
        <DashboardLayout title="Urlaubsantrag">
            <Head title="Urlaubsantrag" />

            <div className="max-w-3xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <Link href={route('vacation.index')} className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Zurueck zur Uebersicht
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Urlaubsantrag</h1>
                    </div>
                    {canApprove && isPending && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleApprove}
                                className="px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                            >
                                Genehmigen
                            </button>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                            >
                                Ablehnen
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Mitarbeiter</p>
                                <p className="text-lg font-semibold text-gray-900">{leaveRequest.user?.name}</p>
                            </div>
                            <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${statusColors[leaveRequest.status] || 'bg-gray-100 text-gray-800'}`}>
                                {statusLabels[leaveRequest.status] || leaveRequest.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm text-gray-500">Art</p>
                                <p className="font-medium text-gray-900">{typeLabels[leaveRequest.type] || leaveRequest.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Von</p>
                                <p className="font-medium text-gray-900">{formatDate(leaveRequest.start_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Bis</p>
                                <p className="font-medium text-gray-900">{formatDate(leaveRequest.end_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tage</p>
                                <p className="font-medium text-gray-900">{leaveRequest.days}</p>
                            </div>
                        </div>

                        {leaveRequest.notes && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Notizen</p>
                                <p className="text-gray-900">{leaveRequest.notes}</p>
                            </div>
                        )}

                        {leaveRequest.approver && (
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">
                                    {leaveRequest.status === 'approved' ? 'Genehmigt von' : 'Abgelehnt von'}
                                </p>
                                <p className="font-medium text-gray-900">{leaveRequest.approver.name}</p>
                                {leaveRequest.approved_at && (
                                    <p className="text-sm text-gray-500">am {formatDate(leaveRequest.approved_at)}</p>
                                )}
                            </div>
                        )}

                        {leaveRequest.rejection_reason && (
                            <div className="bg-red-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-red-800 mb-1">Ablehnungsgrund</p>
                                <p className="text-red-700">{leaveRequest.rejection_reason}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold text-gray-900">Antrag ablehnen</h2>
                            <IconButton onClick={() => setShowRejectModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleReject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ablehnungsgrund *</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="Bitte geben Sie einen Grund an..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Abbrechen</Button>
                                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors">
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
