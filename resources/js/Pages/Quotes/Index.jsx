import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

export default function QuotesIndex({ quotes, customers, filters, statuses = [] }) {
    const [sort, setSort] = useState(typeof filters?.sort === 'string' ? filters.sort : 'created_desc');
    const [search, setSearch] = useState(typeof filters?.search === 'string' ? filters.search : '');
    const [selectedIds, setSelectedIds] = useState([]);

    const showArchived = filters?.show_archived === '1' || filters?.show_archived === true;

    const navigate = (params) => {
        const url = new URL(route('quotes.index'));
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
        if (e) e.preventDefault();
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
        if (selectedIds.length === quotes.data.length) setSelectedIds([]);
        else setSelectedIds(quotes.data.map(q => q.id));
    };
    const handleBulkArchive = () => {
        if (!selectedIds.length) return;
        router.post(route('quotes.bulkArchive'), { ids: selectedIds }, { onSuccess: () => setSelectedIds([]) });
    };

    const getStatusInfo = (statusValue) => {
        const status = statuses.find(s => s.value === statusValue);
        return status ? { color: status.color, label: status.label } : { color: 'bg-gray-100 text-gray-800', label: statusValue };
    };

    const statusIcon = (s) => {
        if (s === 'accepted') return <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>;
        if (s === 'declined') return <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
        if (s === 'sent') return <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        if (s === 'expired') return <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>;
        return null;
    };

    const rowBg = (s) => ({ accepted: 'bg-green-50/40', declined: 'bg-red-50/30', sent: 'bg-blue-50/20', expired: 'bg-orange-50/30' }[s] ?? '');

    const DaysBadge = ({ date }) => {
        const today = new Date(); today.setHours(0,0,0,0);
        const due = new Date(date); due.setHours(0,0,0,0);
        const days = Math.round((due - today) / 86400000);
        const label = days < 0 ? `${Math.abs(days)}T abgelaufen` : days === 0 ? 'Heute' : `${days}T`;
        const cls = days < 0 ? 'bg-red-100 text-red-700' : days <= 3 ? 'bg-orange-100 text-orange-700' : days <= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500';
        return <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
    };

    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        number: '',
        customer_id: '',
        valid_until: '',
        status: 'draft',
        notes: '',
        items: [{ description: '', quantity: 1, unit_price: 0 }],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('quotes.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
                setData('items', [{ description: '', quantity: 1, unit_price: 0 }]);
            }
        });
    };

    const addItem = () => {
        setData('items', [...data.items, { description: '', quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    return (
        <DashboardLayout title="Angebote">
            <Head title="Angebote" />
            <PageHeader
                title="Angebote"
                subtitle={showArchived ? 'Archivierte Angebote' : 'Verwalten Sie Ihre Angebote'}
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Neues Angebot
                    </Button>
                }
            >
                <div className="mt-4 flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            onSubmit={handleSearch}
                            placeholder="Angebote suchen..."
                        />
                    </div>
                    <select name="status" defaultValue={filters?.status || ''} onChange={e => navigate({ status: e.target.value, search, sort })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Alle Status</option>
                        <option value="draft">Entwurf</option>
                        <option value="sent">Gesendet</option>
                        <option value="accepted">Angenommen</option>
                        <option value="declined">Abgelehnt</option>
                        <option value="expired">Abgelaufen</option>
                    </select>
                    <select
                        value={sort}
                        onChange={e => handleSort(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="created_desc">Neueste zuerst</option>
                        <option value="created_asc">Älteste zuerst</option>
                        <option value="status">Nach Status</option>
                        <option value="valid_until">Nach Gültigkeit</option>
                        <option value="amount_desc">Höchster Betrag</option>
                    </select>
                    <button
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
                </div>
            </PageHeader>

            {/* Bulk action bar */}
            {selectedIds.length > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-4 flex items-center justify-between">
                    <span className="text-sm text-primary-800 font-medium">{selectedIds.length} ausgewählt</span>
                    <div className="flex gap-2">
                        {!showArchived && <Button variant="secondary" onClick={handleBulkArchive}>Archivieren</Button>}
                        <Button variant="secondary" onClick={() => setSelectedIds([])}>Aufheben</Button>
                    </div>
                </div>
            )}

            <div className={`bg-white rounded-xl shadow-sm border ${showArchived ? 'border-amber-200' : 'border-gray-100'}`}>
                {quotes.data.length === 0 ? (
                    <EmptyState
                        title={showArchived ? 'Keine archivierten Angebote' : 'Noch keine Angebote vorhanden'}
                        description={showArchived ? 'Es gibt keine archivierten Angebote.' : 'Erstellen Sie Ihr erstes Angebot, um zu beginnen.'}
                        onAction={showArchived ? undefined : () => setShowModal(true)}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">
                                        <input type="checkbox" checked={selectedIds.length === quotes.data.length && quotes.data.length > 0} onChange={toggleAll} className="rounded border-gray-300" />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nummer</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kunde</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Betrag</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gültig bis</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {quotes.data.map((quote) => (
                                    <tr key={quote.id} className={`transition-colors hover:brightness-95 ${showArchived ? 'bg-amber-50/20' : rowBg(quote.status)}`}>
                                        <td className="px-6 py-3.5">
                                            <input type="checkbox" checked={selectedIds.includes(quote.id)} onChange={() => toggleSelect(quote.id)} className="rounded border-gray-300" />
                                        </td>
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Link href={route('quotes.show', quote.id)} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">{quote.number}</Link>
                                                {showArchived && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Archiv</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 whitespace-nowrap text-gray-600 text-sm">{quote.customer?.name || '-'}</td>
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span className="font-bold text-gray-900 text-base">{quote.total ? parseFloat(quote.total).toLocaleString('de-DE') + ' €' : '-'}</span>
                                        </td>
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${getStatusInfo(quote.status).color}`}>
                                                {statusIcon(quote.status)}
                                                {getStatusInfo(quote.status).label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            {quote.valid_until ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500">{new Date(quote.valid_until).toLocaleDateString('de-DE')}</span>
                                                    {quote.status !== 'accepted' && quote.status !== 'declined' && <DaysBadge date={quote.valid_until} />}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-3.5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={route('quotes.show', quote.id)} className="text-gray-400 hover:text-primary-600 transition-colors" title="Anzeigen">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </Link>
                                                {!showArchived && (
                                                    <Link href={route('quotes.edit', quote.id)} className="text-gray-400 hover:text-primary-600 transition-colors" title="Bearbeiten">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </Link>
                                                )}
                                                {showArchived ? (
                                                    <button onClick={() => router.post(route('quotes.restore', quote.id))} className="text-xs text-amber-700 hover:text-amber-900 font-medium">Wiederherstellen</button>
                                                ) : (
                                                    <button onClick={() => router.post(route('quotes.archive', quote.id))} className="text-gray-300 hover:text-gray-500" title="Archivieren">
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
                )}
                <Pagination links={quotes.links} from={quotes.from} to={quotes.to} total={quotes.total} entityName="Angebote" />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">Neues Angebot</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Angebotsnummer *</label>
                                    <input type="text" value={data.number} onChange={e => setData('number', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
                                    <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                        <option value="">Kunde wählen</option>
                                        {(customers || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gültig bis</label>
                                    <input type="date" value={data.valid_until} onChange={e => setData('valid_until', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                        <option value="draft">Entwurf</option>
                                        <option value="sent">Gesendet</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Positionen</label>
                                    <button type="button" onClick={addItem} className="text-sm text-primary-600 hover:text-primary-700 transition-colors">+ Position hinzufügen</button>
                                </div>
                                {data.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                                        <div className="col-span-6">
                                            <input type="text" placeholder="Beschreibung" value={item.description} onChange={e => setData('items', data.items.map((it, i) => i === index ? { ...it, description: e.target.value } : it))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" placeholder="Menge" value={item.quantity} onChange={e => setData('items', data.items.map((it, i) => i === index ? { ...it, quantity: parseFloat(e.target.value) } : it))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" step="0.01" placeholder="Preis €" value={item.unit_price} onChange={e => setData('items', data.items.map((it, i) => i === index ? { ...it, unit_price: parseFloat(e.target.value) } : it))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            <span className="text-sm font-medium">{(item.quantity * item.unit_price).toFixed(2)} €</span>
                                            {data.items.length > 1 && <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 transition-colors">✕</button>}
                                        </div>
                                    </div>
                                ))}
                                <div className="text-right font-semibold mt-2">Gesamt: {calculateTotal().toFixed(2)} €</div>
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
