import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

export default function InvoicesIndex({ invoices, customers, projects, filters, statuses = [] }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');
    const [sort, setSort] = useState(typeof filters?.sort === 'string' ? filters.sort : 'created_desc');
    const [search, setSearch] = useState(typeof filters?.search === 'string' ? filters.search : '');

    const showArchived = filters?.show_archived === '1' || filters?.show_archived === true;

    const navigate = (params) => {
        const url = new URL(route('invoices.index'));
        const merged = {
            search: typeof filters?.search === 'string' ? filters.search : '',
            sort: typeof filters?.sort === 'string' ? filters.sort : 'created_desc',
            show_archived: showArchived ? '1' : '',
            status: filters?.status || '',
            ...params,
        };
        Object.entries(merged).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
        router.visit(url.toString(), { preserveScroll: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        navigate({ search });
    };

    const handleSort = (newSort) => {
        setSort(newSort);
        navigate({ sort: newSort, search });
    };

    const toggleArchived = () => {
        navigate({ show_archived: showArchived ? '' : '1', search, sort });
    };

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
    const handleBulkArchive = () => {
        if (!selectedIds.length) return;
        router.post(route('invoices.bulkArchive'), { ids: selectedIds }, { onSuccess: () => setSelectedIds([]) });
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

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('invoices.store'), {
            onSuccess: () => {
                setShowModal(false);
                setData({ number: '', customer_id: '', project_id: '', status: 'draft', issue_date: '', due_date: '', notes: '' });
            }
        });
    };

    const getStatusInfo = (statusValue) => {
        const status = statuses.find(s => s.value === statusValue);
        return status ? { color: status.color, label: status.label } : { color: 'bg-gray-100 text-gray-800', label: statusValue };
    };

    const statusIcon = (s) => {
        if (s === 'paid') return <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>;
        if (s === 'overdue') return <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>;
        if (s === 'sent') return <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        return null;
    };

    const rowBg = (s) => ({ paid: 'bg-green-50/40', overdue: 'bg-red-50/50', sent: 'bg-blue-50/20' }[s] ?? '');

    const DaysBadge = ({ date }) => {
        const today = new Date(); today.setHours(0,0,0,0);
        const due = new Date(date); due.setHours(0,0,0,0);
        const days = Math.round((due - today) / 86400000);
        const label = days < 0 ? `${Math.abs(days)}T überfällig` : days === 0 ? 'Heute' : days === 1 ? 'Morgen' : `${days}T`;
        const cls = days < 0 ? 'bg-red-100 text-red-700' : days <= 3 ? 'bg-orange-100 text-orange-700' : days <= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500';
        return <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
    };

    return (
        <DashboardLayout title="Rechnungen">
            <Head title="Rechnungen" />

            <PageHeader
                title="Rechnungen"
                subtitle={showArchived ? 'Archivierte Rechnungen' : 'Verwalten Sie Ihre Rechnungen'}
                actions={
                    <div className="flex gap-2">
                        <a href={route('export.invoices')} className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            CSV Export
                        </a>
                        <Button onClick={() => router.visit(route('invoices.create'))}>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Neue Rechnung
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleSearch} className="mt-4 flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechnungsnummer suchen..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <select name="status" defaultValue={filters?.status || ''} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Alle Status</option>
                        <option value="draft">Entwurf</option>
                        <option value="sent">Gesendet</option>
                        <option value="paid">Bezahlt</option>
                        <option value="overdue">Überfällig</option>
                        <option value="cancelled">Storniert</option>
                    </select>
                    <select
                        value={sort}
                        onChange={e => handleSort(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="created_desc">Neueste zuerst</option>
                        <option value="created_asc">Älteste zuerst</option>
                        <option value="status">Nach Status</option>
                        <option value="due_date">Nach Fälligkeit</option>
                        <option value="amount_desc">Höchster Betrag</option>
                    </select>
                    <Button type="submit" variant="secondary">Filtern</Button>
                    <button
                        type="button"
                        onClick={toggleArchived}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                            showArchived
                                ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" />
                        </svg>
                        {showArchived ? 'Aktive anzeigen' : 'Archiv'}
                    </button>
                </form>
            </PageHeader>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-4 flex items-center justify-between">
                    <span className="text-sm text-primary-800 font-medium">{selectedIds.length} ausgewählt</span>
                    <div className="flex gap-2 items-center">
                        {!showArchived && (
                            <>
                                <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-sm">
                                    <option value="">Status ändern...</option>
                                    <option value="draft">Entwurf</option>
                                    <option value="sent">Gesendet</option>
                                    <option value="paid">Bezahlt</option>
                                </select>
                                {bulkStatus && <Button onClick={handleBulkStatus}>Anwenden</Button>}
                                <Button variant="secondary" onClick={handleBulkArchive}>Archivieren</Button>
                            </>
                        )}
                        <Button variant="secondary" onClick={() => setSelectedIds([])}>Aufheben</Button>
                    </div>
                </div>
            )}

            <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${showArchived ? 'border-amber-200' : 'border-gray-100'}`}>
                {invoices.data.length === 0 ? (
                    <div className="px-6 py-12">
                        <EmptyState
                            title={showArchived ? 'Keine archivierten Rechnungen' : 'Noch keine Rechnungen vorhanden'}
                            description={showArchived ? 'Es gibt keine archivierten Rechnungen.' : 'Erstellen Sie Ihre erste Rechnung, um zu beginnen.'}
                            actionLabel="Erste Rechnung erstellen"
                            onAction={showArchived ? undefined : () => setShowModal(true)}
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
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {invoices.data.map((invoice) => (
                                        <tr key={invoice.id} className={`transition-colors hover:brightness-95 ${showArchived ? 'bg-amber-50/20' : rowBg(invoice.status)}`}>
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <input type="checkbox" checked={selectedIds.includes(invoice.id)} onChange={() => toggleSelect(invoice.id)} className="rounded border-gray-300" />
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Link href={route('invoices.show', invoice.id)} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">{invoice.number}</Link>
                                                    {showArchived && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Archiv</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-gray-600 text-sm">{invoice.customer?.name || '-'}</td>
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <span className="font-bold text-gray-900 text-base">{invoice.total ? parseFloat(invoice.total).toLocaleString('de-DE') + ' €' : '-'}</span>
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${getStatusInfo(invoice.status).color}`}>
                                                    {statusIcon(invoice.status)}
                                                    {getStatusInfo(invoice.status).label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                {invoice.due_date ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-500">{new Date(invoice.due_date).toLocaleDateString('de-DE')}</span>
                                                        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && <DaysBadge date={invoice.due_date} />}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('invoices.show', invoice.id)} className="text-gray-400 hover:text-primary-600 transition-colors" title="Anzeigen">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </Link>
                                                    {!showArchived && (
                                                        <Link href={route('invoices.edit', invoice.id)} className="text-gray-400 hover:text-primary-600 transition-colors" title="Bearbeiten">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </Link>
                                                    )}
                                                    {showArchived ? (
                                                        <button onClick={() => router.post(route('invoices.restore', invoice.id))} className="text-xs text-amber-700 hover:text-amber-900 font-medium">Wiederherstellen</button>
                                                    ) : (
                                                        <button onClick={() => router.post(route('invoices.archive', invoice.id))} className="text-gray-300 hover:text-gray-500" title="Archivieren">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {invoices.data.map((invoice) => (
                                <div key={invoice.id} className={`p-4 hover:bg-gray-50 transition-colors ${showArchived ? 'bg-amber-50/20' : ''}`}>
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
                                        {showArchived ? (
                                            <button onClick={() => router.post(route('invoices.restore', invoice.id))} className="text-xs text-amber-700 hover:text-amber-900 font-medium">Wiederherstellen</button>
                                        ) : (
                                            <button onClick={() => router.post(route('invoices.archive', invoice.id))} className="text-xs text-gray-400 hover:text-gray-600">Archivieren</button>
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
                                <Button type="submit" disabled={processing}>
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
