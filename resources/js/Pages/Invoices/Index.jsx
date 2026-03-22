import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

export default function InvoicesIndex({ invoices, customers, projects, filters, statuses = [] }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    const toggleAll = () => {
        if (selectedIds.length === invoices.data.length) setSelectedIds([]);
        else setSelectedIds(invoices.data.map(i => i.id));
    };
    const handleBulkStatus = () => {
        if (!bulkStatus) return;
        router.post(route('invoices.bulkUpdateStatus'), { ids: selectedIds, status: bulkStatus }, { onSuccess: () => { setSelectedIds([]); setBulkStatus(''); } });
    };

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
        router.visit(url.toString());
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
                    <div className="flex gap-2">
                        <a href={route('export.invoices')} className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            CSV Export
                        </a>
                        <Button onClick={() => setShowModal(true)}>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Neue Rechnung
                        </Button>
                    </div>
                }
            />

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-4 flex items-center justify-between">
                    <span className="text-sm text-primary-800 font-medium">{selectedIds.length} ausgewaehlt</span>
                    <div className="flex gap-2 items-center">
                        <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-sm">
                            <option value="">Status aendern...</option>
                            <option value="draft">Entwurf</option>
                            <option value="sent">Gesendet</option>
                            <option value="paid">Bezahlt</option>
                        </select>
                        {bulkStatus && <Button onClick={handleBulkStatus}>Anwenden</Button>}
                        <Button variant="secondary" onClick={() => setSelectedIds([])}>Aufheben</Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {invoices.data.length === 0 ? (
                    <div className="px-6 py-12">
                        <EmptyState
                            title="Noch keine Rechnungen vorhanden"
                            description="Erstellen Sie Ihre erste Rechnung, um zu beginnen."
                            actionLabel="Erste Rechnung erstellen"
                            onAction={() => setShowModal(true)}
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">
                                            <input type="checkbox" checked={selectedIds.length === invoices.data.length && invoices.data.length > 0} onChange={toggleAll} className="rounded border-gray-300" />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nummer</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kunde</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Betrag</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fällig</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {invoices.data.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input type="checkbox" checked={selectedIds.includes(invoice.id)} onChange={() => toggleSelect(invoice.id)} className="rounded border-gray-300" />
                                            </td>
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

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {invoices.data.map((invoice) => (
                                <div key={invoice.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <input type="checkbox" checked={selectedIds.includes(invoice.id)} onChange={() => toggleSelect(invoice.id)} className="rounded border-gray-300 mt-1" />
                                            <div>
                                                <Link href={route('invoices.show', invoice.id)} className="font-medium text-gray-900 hover:text-primary-600">
                                                    {invoice.number}
                                                </Link>
                                                <p className="text-sm text-gray-500">{invoice.customer?.name || '-'}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusInfo(invoice.status).color}`}>{getStatusInfo(invoice.status).label}</span>
                                    </div>
                                    <div className="mt-2 ml-8 flex items-center justify-between">
                                        <span className="font-medium text-gray-900">{invoice.total ? parseFloat(invoice.total).toLocaleString('de-DE') + ' €' : '-'}</span>
                                        {invoice.due_date && (
                                            <span className="text-sm text-gray-500">{new Date(invoice.due_date).toLocaleDateString('de-DE')}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                <Pagination links={invoices.links} from={invoices.from} to={invoices.to} total={invoices.total} entityName="Rechnungen" />
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
