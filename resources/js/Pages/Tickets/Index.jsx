import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function TicketsIndex({ tickets, filters }) {
    const { data, setData, post, processing } = useForm({
        title: '',
        description: '',
        customer_id: '',
        project_id: '',
        assigned_to: '',
        priority: 'medium',
    });

    const [showModal, setShowModal] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('tickets.store'), {
            onSuccess: () => {
                setShowModal(false);
                setData({ title: '', description: '', customer_id: '', project_id: '', assigned_to: '', priority: 'medium' });
            }
        });
    };

    const statusColors = {
        open: 'bg-red-100 text-red-800',
        in_progress: 'bg-blue-100 text-blue-800',
        pending: 'bg-yellow-100 text-yellow-800',
        resolved: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800',
    };

    const statusLabels = {
        open: 'Offen',
        in_progress: 'In Bearbeitung',
        pending: 'Wartend',
        resolved: 'Gelöst',
        closed: 'Geschlossen',
    };

    const priorityColors = {
        low: 'bg-gray-100 text-gray-800',
        medium: 'bg-blue-100 text-blue-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800',
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
                    <p className="text-sm text-gray-500 mt-1">Support-Tickets verwalten</p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Neues Ticket
                </button>
            </div>

            {/* Filters */}
            <form method="get" className="mb-4 flex flex-wrap gap-2">
                <input
                    type="text"
                    name="search"
                    defaultValue={filters?.search || ''}
                    placeholder="Suchen..."
                    className="border rounded-lg px-4 py-2"
                />
                <select name="status" defaultValue={filters?.status || ''} className="border rounded-lg px-4 py-2">
                    <option value="">Alle Status</option>
                    <option value="open">Offen</option>
                    <option value="in_progress">In Bearbeitung</option>
                    <option value="pending">Wartend</option>
                    <option value="resolved">Gelöst</option>
                    <option value="closed">Geschlossen</option>
                </select>
                <select name="priority" defaultValue={filters?.priority || ''} className="border rounded-lg px-4 py-2">
                    <option value="">Alle Prioritäten</option>
                    <option value="low">Niedrig</option>
                    <option value="medium">Mittel</option>
                    <option value="high">Hoch</option>
                    <option value="urgent">Dringend</option>
                </select>
                <button type="submit" className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Filtern</button>
            </form>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                {tickets.data.length === 0 ? (
                    <div className="p-12 text-center text-gray-500"><p>Noch keine Tickets vorhanden</p></div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {tickets.data.map((ticket) => (
                            <div key={ticket.id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link href={route('tickets.show', ticket.id)} className="font-medium text-gray-900 hover:text-primary-600">
                                                #{ticket.id} {ticket.title}
                                            </Link>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${priorityColors[ticket.priority]}`}>{priorityLabels[ticket.priority] || ticket.priority}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-1">{ticket.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                            {ticket.customer && <span>{ticket.customer.name}</span>}
                                            {ticket.project && <span>{ticket.project.name}</span>}
                                            {ticket.assignee && <span>→ {ticket.assignee.name}</span>}
                                            <span>{new Date(ticket.created_at).toLocaleDateString('de-DE')}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[ticket.status]}`}>{statusLabels[ticket.status] || ticket.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {tickets.links && tickets.links.length > 3 && (
                <div className="mt-4 flex justify-center gap-2">
                    {tickets.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`px-3 py-1 rounded ${link.active ? 'bg-primary-600 text-white' : 'bg-white border'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">Neues Ticket</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Titel *</label>
                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full border rounded-lg px-4 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Beschreibung</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={3} className="w-full border rounded-lg px-4 py-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Kunde</label>
                                    <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)} className="w-full border rounded-lg px-4 py-2">
                                        <option value="">Kein Kunde</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Projekt</label>
                                    <select value={data.project_id} onChange={e => setData('project_id', e.target.value)} className="w-full border rounded-lg px-4 py-2">
                                        <option value="">Kein Projekt</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Zugewiesen an</label>
                                    <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)} className="w-full border rounded-lg px-4 py-2">
                                        <option value="">Nicht zugewiesen</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Priorität</label>
                                    <select value={data.priority} onChange={e => setData('priority', e.target.value)} className="w-full border rounded-lg px-4 py-2">
                                        <option value="low">Niedrig</option>
                                        <option value="medium">Mittel</option>
                                        <option value="high">Hoch</option>
                                        <option value="urgent">Dringend</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Abbrechen</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Erstellen</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
