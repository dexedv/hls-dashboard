import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import StatusBadge from '@/Components/StatusBadge';
import Pagination from '@/Components/Pagination';
import UserAvatar from '@/Components/UserAvatar';

export default function TicketsIndex({ tickets, customers, projects, users, filters, statuses = [], priorities = [] }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing } = useForm({
        title: '',
        description: '',
        customer_id: '',
        project_id: '',
        assigned_to: '',
        priority: 'medium',
    });

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(typeof filters?.search === 'string' ? filters.search : '');
    const [sort, setSort] = useState(typeof filters?.sort === 'string' ? filters.sort : 'created_desc');
    const [selectedIds, setSelectedIds] = useState([]);

    const showArchived = filters?.show_archived === '1' || filters?.show_archived === true;

    const navigate = (params) => {
        const url = new URL(route('tickets.index'));
        const merged = {
            search: typeof filters?.search === 'string' ? filters.search : '',
            sort: typeof filters?.sort === 'string' ? filters.sort : 'created_desc',
            show_archived: showArchived ? '1' : '',
            status: filters?.status || '',
            priority: filters?.priority || '',
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

    const handleBulkArchive = () => {
        if (!selectedIds.length) return;
        router.post(route('tickets.bulkArchive'), { ids: selectedIds }, {
            onSuccess: () => setSelectedIds([]),
        });
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    const toggleAll = () => {
        if (selectedIds.length === tickets.data.length) setSelectedIds([]);
        else setSelectedIds(tickets.data.map(t => t.id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('tickets.store'), {
            onSuccess: () => {
                setShowModal(false);
                setData({ title: '', description: '', customer_id: '', project_id: '', assigned_to: '', priority: 'medium' });
            }
        });
    };

    const priorityColors = {
        low: 'bg-gray-100 text-gray-700 border-gray-200',
        medium: 'bg-blue-100 text-blue-700 border-blue-200',
        high: 'bg-orange-100 text-orange-700 border-orange-200',
        urgent: 'bg-red-100 text-red-700 border-red-200',
    };

    const priorityLabels = {
        low: 'Niedrig',
        medium: 'Mittel',
        high: 'Hoch',
        urgent: 'Dringend',
    };

    return (
        <DashboardLayout title="Tickets">
            <Head title="Tickets" />

            {/* Page Header */}
            <PageHeader
                title="Tickets"
                subtitle={showArchived ? 'Archivierte Tickets' : 'Support-Tickets verwalten'}
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Neues Ticket
                    </Button>
                }
            >
                {/* Filters */}
                <form method="get" onSubmit={handleSearch} className="mt-4 flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[200px]">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            onSubmit={handleSearch}
                            placeholder="Tickets suchen..."
                        />
                    </div>
                    <select name="status" defaultValue={filters?.status || ''} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="">Alle Status</option>
                        <option value="open">Offen</option>
                        <option value="in_progress">In Bearbeitung</option>
                        <option value="pending">Wartend</option>
                        <option value="resolved">Gelöst</option>
                        <option value="closed">Geschlossen</option>
                    </select>
                    <select name="priority" defaultValue={filters?.priority || ''} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="">Alle Prioritäten</option>
                        <option value="low">Niedrig</option>
                        <option value="medium">Mittel</option>
                        <option value="high">Hoch</option>
                        <option value="urgent">Dringend</option>
                    </select>
                    <select
                        value={sort}
                        onChange={e => handleSort(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="created_desc">Neueste zuerst</option>
                        <option value="created_asc">Älteste zuerst</option>
                        <option value="status">Nach Status</option>
                        <option value="priority">Nach Priorität</option>
                    </select>
                    <Button type="submit" variant="secondary">
                        Filtern
                    </Button>
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

            {/* Bulk action bar */}
            {selectedIds.length > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-4 flex items-center justify-between">
                    <span className="text-sm text-primary-800 font-medium">{selectedIds.length} ausgewählt</span>
                    <div className="flex gap-2">
                        {!showArchived && <Button onClick={handleBulkArchive} variant="secondary">Archivieren</Button>}
                        <Button variant="secondary" onClick={() => setSelectedIds([])}>Aufheben</Button>
                    </div>
                </div>
            )}

            <div className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200 ${showArchived ? 'border-amber-200' : 'border-gray-100'}`}>
                {tickets.data.length === 0 ? (
                    <EmptyState
                        title={showArchived ? 'Keine archivierten Tickets' : 'Noch keine Tickets vorhanden'}
                        description={showArchived ? 'Es gibt keine archivierten Tickets.' : 'Erstellen Sie Ihr erstes Ticket, um loszulegen.'}
                        actionLabel="Erstes Ticket anlegen"
                        onAction={showArchived ? undefined : () => setShowModal(true)}
                    />
                ) : (
                    <div className="divide-y divide-gray-100">
                        {/* Select-all header */}
                        <div className="px-4 py-2 bg-gray-50 flex items-center gap-3">
                            <input type="checkbox" checked={selectedIds.length === tickets.data.length && tickets.data.length > 0} onChange={toggleAll} className="rounded border-gray-300" />
                            <span className="text-xs text-gray-500">Alle auswählen</span>
                        </div>
                        {tickets.data.map((ticket) => {
                            const isAssignedToMe = ticket.assignees?.some(a => a.id === auth?.user?.id);
                            const isSelected = selectedIds.includes(ticket.id);
                            const priorityBorder = { urgent: 'border-l-red-500', high: 'border-l-orange-400', medium: 'border-l-blue-400', low: 'border-l-gray-300' }[ticket.priority] ?? 'border-l-gray-200';
                            return (
                            <div key={ticket.id} className={`border-l-4 transition-colors duration-150 ${priorityBorder} ${
                                showArchived ? 'bg-amber-50/30' : isAssignedToMe ? 'bg-primary-50/40 hover:bg-primary-50' : 'hover:bg-gray-50'
                            } ${isSelected ? 'bg-primary-50/60' : ''}`}>
                                {/* Main row */}
                                <div className="flex items-center gap-3 px-4 pt-3 pb-1">
                                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(ticket.id)} className="rounded border-gray-300 flex-shrink-0" />
                                    <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">#{ticket.id}</span>
                                    <Link href={route('tickets.show', ticket.id)} className="font-medium text-gray-900 hover:text-primary-600 transition-colors flex-1 min-w-0 truncate">
                                        {ticket.title}
                                    </Link>
                                    {isAssignedToMe && !showArchived && <span className="text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded font-semibold flex-shrink-0">Ich</span>}
                                    {showArchived && <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-semibold flex-shrink-0">Archiv</span>}
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${priorityColors[ticket.priority] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                        {priorityLabels[ticket.priority] || ticket.priority}
                                    </span>
                                    <StatusBadge status={ticket.status} statuses={statuses} />
                                    {showArchived ? (
                                        <button onClick={() => router.post(route('tickets.restore', ticket.id))} className="text-xs text-amber-700 hover:text-amber-900 font-medium flex-shrink-0">Wiederherstellen</button>
                                    ) : (
                                        <button onClick={() => router.post(route('tickets.archive', ticket.id))} className="text-gray-300 hover:text-gray-500 flex-shrink-0" title="Archivieren">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" /></svg>
                                        </button>
                                    )}
                                </div>
                                {/* Footer meta */}
                                <div className="flex items-center gap-4 px-4 pb-2.5 ml-14 text-xs text-gray-400">
                                    {ticket.customer && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            {ticket.customer.name}
                                        </span>
                                    )}
                                    {ticket.project && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                            {ticket.project.name}
                                        </span>
                                    )}
                                    {ticket.assignees && ticket.assignees.length > 0 && (
                                        <span className="flex items-center gap-0.5">
                                            {ticket.assignees.slice(0, 4).map(a => (
                                                <UserAvatar key={a.id} user={a} size="xs" className="-ml-0.5 first:ml-0 border-2 border-white" />
                                            ))}
                                            {ticket.assignees.length > 4 && <span className="ml-1">+{ticket.assignees.length - 4}</span>}
                                        </span>
                                    )}
                                    <span>{new Date(ticket.created_at).toLocaleDateString('de-DE')}</span>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            <Pagination links={tickets.links} from={tickets.from} to={tickets.to} total={tickets.total} entityName="Tickets" />

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-100">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Neues Ticket</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
                                    <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        <option value="">Kein Kunde</option>
                                        {(customers || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                                    <select value={data.project_id} onChange={e => setData('project_id', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        <option value="">Kein Projekt</option>
                                        {(projects || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Zugewiesen an</label>
                                    <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        <option value="">Nicht zugewiesen</option>
                                        {(users || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
                                    <select value={data.priority} onChange={e => setData('priority', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        <option value="low">Niedrig</option>
                                        <option value="medium">Mittel</option>
                                        <option value="high">Hoch</option>
                                        <option value="urgent">Dringend</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
                                    Abbrechen
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Erstellen
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
