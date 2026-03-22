import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';

export default function CalendarShow({ event }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('de-DE', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
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
                        <Link href={route('calendar.index')}>
                            <Button variant="secondary">Zurueck</Button>
                        </Link>
                    </div>
                }
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Titel</dt>
                        <dd className="mt-1 text-gray-900">{event.title}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Projekt</dt>
                        <dd className="mt-1 text-gray-900">{event.project?.name || '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Start</dt>
                        <dd className="mt-1 text-gray-900">{formatDate(event.start)}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Ende</dt>
                        <dd className="mt-1 text-gray-900">{formatDate(event.end)}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Ganztaegig</dt>
                        <dd className="mt-1 text-gray-900">{event.all_day ? 'Ja' : 'Nein'}</dd>
                    </div>
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
