import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-orange-100 text-orange-800',
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
    low: 'bg-gray-100 text-gray-700',
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

export default function TicketShow({ ticket }) {
    const { data, setData, post, processing, reset } = useForm({ content: '' });
    const [deleting, setDeleting] = useState(false);

    const handleComment = (e) => {
        e.preventDefault();
        post(route('tickets.comment', ticket.id), {
            onSuccess: () => reset('content'),
        });
    };

    const handleDelete = () => {
        if (!confirm('Ticket wirklich löschen?')) return;
        setDeleting(true);
        router.delete(route('tickets.destroy', ticket.id));
    };

    return (
        <DashboardLayout title={`Ticket #${ticket.id}`}>
            <Head title={`Ticket #${ticket.id}: ${ticket.title}`} />

            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/tickets" className="hover:text-primary-600">Tickets</Link>
                <span>/</span>
                <span className="text-gray-900">#{ticket.id} {ticket.title}</span>
            </nav>

            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">#{ticket.id} {ticket.title}</h1>
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}`}>
                            {statusLabels[ticket.status] || ticket.status}
                        </span>
                    </div>
                    {ticket.customer && (
                        <p className="text-sm text-gray-500 mt-1">{ticket.customer.name}</p>
                    )}
                </div>
                <div className="flex gap-3">
                    <Link
                        href={route('tickets.edit', ticket.id)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                    >
                        Bearbeiten
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
                    >
                        Löschen
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Beschreibung</h2>
                        {ticket.description ? (
                            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                        ) : (
                            <p className="text-gray-400 text-sm italic">Keine Beschreibung vorhanden.</p>
                        )}
                    </div>

                    {/* Comments */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Kommentare ({ticket.comments?.length || 0})
                        </h2>

                        {ticket.comments && ticket.comments.length > 0 ? (
                            <ul className="space-y-4 mb-6">
                                {ticket.comments.map((comment) => (
                                    <li key={comment.id} className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-semibold text-primary-700">
                                                {comment.user?.name?.[0]?.toUpperCase() || '?'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm font-semibold text-gray-900">{comment.user?.name || 'Unbekannt'}</span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(comment.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 text-sm italic mb-6">Noch keine Kommentare.</p>
                        )}

                        <form onSubmit={handleComment} className="border-t border-gray-100 pt-4">
                            <textarea
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                rows={3}
                                placeholder="Kommentar schreiben..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                required
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm disabled:opacity-50"
                                >
                                    {processing ? 'Senden...' : 'Kommentar senden'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informationen</h2>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</dt>
                                <dd className="mt-1">
                                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {statusLabels[ticket.status] || ticket.status}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priorität</dt>
                                <dd className="mt-1">
                                    <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[ticket.priority] || 'bg-gray-100 text-gray-700'}`}>
                                        {priorityLabels[ticket.priority] || ticket.priority}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Zugewiesen an</dt>
                                <dd className="mt-1">
                                    {ticket.assignees && ticket.assignees.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {ticket.assignees.map(a => (
                                                <span key={a.id} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                                    <span className="h-4 w-4 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0">
                                                        {a.name?.[0]?.toUpperCase()}
                                                    </span>
                                                    {a.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-900">—</span>
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Kunde</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {ticket.customer ? (
                                        <Link href={route('customers.show', ticket.customer.id)} className="hover:text-primary-600">
                                            {ticket.customer.name}
                                        </Link>
                                    ) : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Projekt</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {ticket.project ? (
                                        <Link href={route('projects.show', ticket.project.id)} className="hover:text-primary-600">
                                            {ticket.project.name}
                                        </Link>
                                    ) : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Erstellt von</dt>
                                <dd className="mt-1 text-sm text-gray-900">{ticket.creator?.name || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Erstellt am</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {new Date(ticket.created_at).toLocaleDateString('de-DE')}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
