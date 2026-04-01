import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';
import UserAvatar from '@/Components/UserAvatar';

const EVENT_TYPE_LABELS = {
    meeting: 'Meeting', deadline: 'Deadline', call: 'Anruf',
    delivery: 'Lieferung', pickup: 'Abholung', reminder: 'Erinnerung', other: 'Sonstiges',
};

export default function CalendarShow({ event }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('de-DE', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const handleDelete = () => {
        if (confirm('Termin wirklich löschen?')) {
            router.delete(route('calendar.destroy', event.id));
        }
    };

    return (
        <DashboardLayout title="Termindetails">
            <Head title={event.title} />

            <PageHeader
                title={event.title}
                subtitle="Termindetails"
                actions={
                    <div className="flex gap-2">
                        <Link href={route('calendar.edit', event.id)}>
                            <Button variant="secondary">Bearbeiten</Button>
                        </Link>
                        <Button variant="danger" onClick={handleDelete}>Löschen</Button>
                        <Link href={route('calendar.index')}>
                            <Button variant="secondary">Zurück</Button>
                        </Link>
                    </div>
                }
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Titel</dt>
                        <dd className="mt-1 text-gray-900 font-medium">{event.title}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Terminart</dt>
                        <dd className="mt-1 text-gray-900">{EVENT_TYPE_LABELS[event.event_type] || event.event_type || '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Start</dt>
                        <dd className="mt-1 text-gray-900">{event.all_day ? new Date(event.start).toLocaleDateString('de-DE') : formatDate(event.start)}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Ende</dt>
                        <dd className="mt-1 text-gray-900">{event.end ? (event.all_day ? new Date(event.end).toLocaleDateString('de-DE') : formatDate(event.end)) : '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Ganztägig</dt>
                        <dd className="mt-1 text-gray-900">{event.all_day ? 'Ja' : 'Nein'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Projekt</dt>
                        <dd className="mt-1 text-gray-900">{event.project?.name || '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Kunde</dt>
                        <dd className="mt-1 text-gray-900">{event.customer?.name || '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Mitarbeiter</dt>
                        <dd className="mt-1">
                            {event.assignees && event.assignees.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {event.assignees.map(a => (
                                        <span key={a.id} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                                            <UserAvatar user={a} size="xs" />
                                            {a.name}
                                        </span>
                                    ))}
                                </div>
                            ) : <span className="text-gray-400">-</span>}
                        </dd>
                    </div>
                    {event.tags && event.tags.length > 0 && (
                        <div className="md:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Tags</dt>
                            <dd className="mt-1 flex flex-wrap gap-1.5">
                                {event.tags.map(tag => (
                                    <span key={tag} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </dd>
                        </div>
                    )}
                    {event.description && (
                        <div className="md:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Beschreibung</dt>
                            <dd className="mt-1 text-gray-900 whitespace-pre-wrap">{event.description}</dd>
                        </div>
                    )}
                </dl>
            </div>
        </DashboardLayout>
    );
}
