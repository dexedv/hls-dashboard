import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import StatusBadge from '@/Components/StatusBadge';
import Pagination from '@/Components/Pagination';

export default function TicketsIndex({ tickets, customers, projects, users, filters, statuses = [], priorities = [] }) {
    const { data, setData, post, processing } = useForm({
        title: '',
        description: '',
        customer_id: '',
        project_id: '',
        assigned_to: '',
        priority: 'medium',
    });

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        const url = new URL(route('tickets.index'));
        if (search) url.searchParams.set('search', search);
        router.visit(url.toString());
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
                subtitle="Support-Tickets verwalten"
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
                <form method="get" className="mt-4 flex flex-wrap gap-3">
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
                    <Button type="submit" variant="secondary">
                        Filtern
                    </Button>
                </form>
            </PageHeader>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                {tickets.data.length === 0 ? (
                    <EmptyState
                        title="Noch keine Tickets vorhanden"
                        description="Erstellen Sie Ihr erstes Ticket, um loszulegen."
                        actionLabel="Erstes Ticket anlegen"
                        onAction={() => setShowModal(true)}
                    />
                ) : (
                    <div className="divide-y divide-gray-100">
                        {tickets.data.map((ticket) => (
                            <div key={ticket.id} className="p-4 hover:bg-gray-50 transition-colors duration-150 rounded-xl mx-1 my-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link href={route('tickets.show', ticket.id)} className="font-medium text-gray-900 hover:text-primary-600 transition-colors">
                                                #{ticket.id} {ticket.title}
                                            </Link>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${priorityColors[ticket.priority] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                {priorityLabels[ticket.priority] || ticket.priority}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-1">{ticket.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                            {ticket.customer && <span>{ticket.customer.name}</span>}
                                            {ticket.project && <span>{ticket.project.name}</span>}
                                            {ticket.assignee && <span>→ {ticket.assignee.name}</span>}
                                            <span>{new Date(ticket.created_at).toLocaleDateString('de-DE')}</span>
                                        </div>
                                    </div>
                                    <StatusBadge status={ticket.status} statuses={statuses} />
                                </div>
                            </div>
                        ))}
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
