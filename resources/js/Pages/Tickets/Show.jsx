import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    open:        'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    pending:     'bg-orange-100 text-orange-700',
    resolved:    'bg-green-100 text-green-700',
    closed:      'bg-gray-100 text-gray-700',
};
const statusLabels = {
    open: 'Offen', in_progress: 'In Bearbeitung', pending: 'Wartend', resolved: 'Gelöst', closed: 'Geschlossen',
};
const priorityColors = {
    low: 'bg-gray-100 text-gray-700', medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700',
};
const priorityLabels = {
    low: 'Niedrig', medium: 'Mittel', high: 'Hoch', urgent: 'Dringend',
};

function relativeTime(dateString) {
    const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
    if (diff < 60) return 'gerade eben';
    if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min`;
    if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std`;
    if (diff < 604800) return `vor ${Math.floor(diff / 86400)} Tagen`;
    return new Date(dateString).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function TicketShow({ ticket }) {
    const { data, setData, post, processing, reset } = useForm({ content: '' });
    const [deleting, setDeleting] = useState(false);
    const [changingStatus, setChangingStatus] = useState(false);

    const handleComment = (e) => {
        e.preventDefault();
        post(route('tickets.comment', ticket.id), { onSuccess: () => reset('content') });
    };

    const handleDelete = () => {
        if (!confirm('Ticket wirklich löschen?')) return;
        setDeleting(true);
        router.delete(route('tickets.destroy', ticket.id));
    };

    const handleStatusChange = (newStatus) => {
        if (newStatus === ticket.status) return;
        setChangingStatus(true);
        router.patch(route('tickets.updateStatus', ticket.id), { status: newStatus }, {
            onFinish: () => setChangingStatus(false),
            preserveScroll: true,
        });
    };

    return (
        <DashboardLayout title={`Ticket #${ticket.id}`}>
            <Head title={`Ticket #${ticket.id}: ${ticket.title}`} />

            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/tickets" className="hover:text-primary-600">Tickets</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">#{ticket.id} {ticket.title}</span>
            </nav>

            <div className="flex items-start justify-between mb-6 gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">#{ticket.id}</span>
                        <h1 className="text-xl font-bold text-gray-900 break-words">{ticket.title}</h1>
                    </div>
                    {ticket.customer && (
                        <p className="text-sm text-gray-500 mt-0.5">
                            <Link href={route('customers.show', ticket.customer.id)} className="hover:text-primary-600">
                                {ticket.customer.name}
                            </Link>
                        </p>
                    )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <Link href={route('tickets.edit', ticket.id)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                        Bearbeiten
                    </Link>
                    <button onClick={handleDelete} disabled={deleting}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50">
                        Löschen
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-3">Beschreibung</h2>
                        {ticket.description ? (
                            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
                        ) : (
                            <p className="text-gray-400 text-sm italic">Keine Beschreibung vorhanden.</p>
                        )}
                    </div>

                    {/* Comments */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">
                                Kommentare
                                <span className="ml-2 text-xs font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                                    {ticket.comments?.length || 0}
                                </span>
                            </h2>
                        </div>

                        {ticket.comments && ticket.comments.length > 0 && (
                            <ul className="divide-y divide-gray-50 px-6 pt-4 pb-2">
                                {ticket.comments.map((comment) => (
                                    <li key={comment.id} className="flex gap-3 py-4">
                                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-primary-700">
                                                {comment.user?.name?.[0]?.toUpperCase() || '?'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-gray-900">{comment.user?.name || 'Unbekannt'}</span>
                                                <span className="text-xs text-gray-400" title={new Date(comment.created_at).toLocaleString('de-DE')}>
                                                    {relativeTime(comment.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {(!ticket.comments || ticket.comments.length === 0) && (
                            <p className="px-6 py-4 text-gray-400 text-sm italic">Noch keine Kommentare.</p>
                        )}

                        <form onSubmit={handleComment} className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <textarea
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                rows={3}
                                placeholder="Kommentar schreiben..."
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none bg-white"
                                required
                            />
                            <div className="flex justify-end mt-2">
                                <button type="submit" disabled={processing}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm disabled:opacity-50 font-medium">
                                    {processing ? 'Senden...' : 'Kommentar senden'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Informationen</h2>
                        <dl className="space-y-3">
                            {/* Inline Status */}
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Status</dt>
                                <dd className="flex flex-wrap gap-1.5">
                                    {Object.entries(statusLabels).map(([val, label]) => (
                                        <button key={val} onClick={() => handleStatusChange(val)} disabled={changingStatus}
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all border cursor-pointer ${
                                                ticket.status === val
                                                    ? `${statusColors[val]} border-transparent ring-2 ring-offset-1 ring-primary-400`
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            } disabled:opacity-50`}>
                                            {label}
                                        </button>
                                    ))}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500">Priorität</dt>
                                <dd>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[ticket.priority] || 'bg-gray-100 text-gray-700'}`}>
                                        {priorityLabels[ticket.priority] || ticket.priority}
                                    </span>
                                </dd>
                            </div>
                            <div className="pt-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500 mb-1.5">Zugewiesen an</dt>
                                <dd>
                                    {ticket.assignees && ticket.assignees.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {ticket.assignees.map(a => (
                                                <span key={a.id} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                                    <span className="h-4 w-4 rounded-full bg-primary-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                        {a.name?.[0]?.toUpperCase()}
                                                    </span>
                                                    {a.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">—</span>
                                    )}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500">Kunde</dt>
                                <dd className="text-sm text-gray-900">
                                    {ticket.customer ? (
                                        <Link href={route('customers.show', ticket.customer.id)} className="hover:text-primary-600 font-medium">
                                            {ticket.customer.name}
                                        </Link>
                                    ) : '—'}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500">Projekt</dt>
                                <dd className="text-sm text-gray-900">
                                    {ticket.project ? (
                                        <Link href={route('projects.show', ticket.project.id)} className="hover:text-primary-600 font-medium">
                                            {ticket.project.name}
                                        </Link>
                                    ) : '—'}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500">Erstellt von</dt>
                                <dd className="text-sm text-gray-900">{ticket.creator?.name || '—'}</dd>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500">Erstellt am</dt>
                                <dd className="text-sm text-gray-900">{new Date(ticket.created_at).toLocaleDateString('de-DE')}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
