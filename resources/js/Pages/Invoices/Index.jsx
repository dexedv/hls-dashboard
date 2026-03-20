import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import EmptyState from '@/Components/EmptyState';

export default function InvoicesIndex({ invoices, customers, projects, filters, statuses = [] }) {
    const { data, setData, post, processing } = useForm({
        number: '',
        customer_id: '',
        project_id: '',
        status: 'draft',
        issue_date: '',
        due_date: '',
        notes: '',
    });

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        const url = new URL(route('invoices.index'));
        if (search) url.searchParams.set('search', search);
        window.location.href = url.toString();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('invoices.store'), {
            onSuccess: () => {
                setShowModal(false);
                setData({ number: '', customer_id: '', project_id: '', status: 'draft', issue_date: '', due_date: '', notes: '' });
            }
        });
    };

    // Dynamic status lookup from props
    const getStatusInfo = (statusValue) => {
        const status = statuses.find(s => s.value === statusValue);
        return status ? { color: status.color, label: status.label } : { color: 'bg-gray-100 text-gray-800', label: statusValue };
    };

    return (
        <DashboardLayout title="Rechnungen">
            <Head title="Rechnungen" />

            <PageHeader
                title="Rechnungen"
                subtitle="Verwalten Sie Ihre Rechnungen"
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Neue Rechnung
                    </Button>
                }
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {invoices.data.length === 0 ? (
                    <EmptyState
                        title="Noch keine Rechnungen vorhanden"
                        description="Erstellen Sie Ihre erste Rechnung, um zu beginnen."
                        actionLabel="Erste Rechnung erstellen"
                        onAction={() => setShowModal(true)}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nummer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kunde</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Betrag</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fällig</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {invoices.data.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={route('invoices.show', invoice.id)} className="font-medium text-gray-900 hover:text-primary-600 transition-colors">{invoice.number}</Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{invoice.customer?.name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{invoice.total ? parseFloat(invoice.total).toLocaleString('de-DE') + ' €' : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusInfo(invoice.status).color}`}>{getStatusInfo(invoice.status).label}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('de-DE') : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-100">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Neue Rechnung</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rechnungsnummer *</label>
                                    <input type="text" value={data.number} onChange={e => setData('number', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                        <option value="draft">Entwurf</option>
                                        <option value="sent">Gesendet</option>
                                        <option value="paid">Bezahlt</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
                                <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                    <option value="">Kunde wählen</option>
                                    {(customers || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                                <select value={data.project_id} onChange={e => setData('project_id', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                    <option value="">Kein Projekt</option>
                                    {(projects || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rechnungsdatum</label>
                                    <input type="date" value={data.issue_date} onChange={e => setData('issue_date', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fälligkeitsdatum</label>
                                    <input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <Button variant="secondary" onClick={() => setShowModal(false)}>
                                    Abbrechen
                                </Button>
                                <Button disabled={processing}>
                                    Speichern
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
