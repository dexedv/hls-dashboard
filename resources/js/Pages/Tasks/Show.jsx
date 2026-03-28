import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-yellow-100 text-yellow-800',
    done: 'bg-green-100 text-green-800',
};
const statusLabels = {
    todo: 'Offen',
    in_progress: 'In Bearbeitung',
    review: 'Überprüfung',
    done: 'Erledigt',
};
const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
};
const priorityLabels = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
    urgent: 'Dringend',
};

export default function TaskShow({ task }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        if (!confirm('Aufgabe wirklich löschen?')) return;
        setDeleting(true);
        router.delete(route('tasks.destroy', task.id));
    };

    return (
        <DashboardLayout title={task.title}>
            <Head title={task.title} />

            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/tasks" className="hover:text-primary-600">Aufgaben</Link>
                <span>/</span>
                <span className="text-gray-900">{task.title}</span>
            </nav>

            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                    {task.project && (
                        <Link href={route('projects.show', task.project.id)} className="text-sm text-gray-500 hover:text-primary-600 mt-1 inline-block">
                            {task.project.name}
                        </Link>
                    )}
                </div>
                <div className="flex gap-3">
                    <Link
                        href={route('tasks.edit', task.id)}
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
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
                        {task.description ? (
                            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
                        ) : (
                            <p className="text-gray-400 text-sm italic">Keine Beschreibung vorhanden.</p>
                        )}
                    </div>

                    {task.time_entries && task.time_entries.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Zeiteinträge</h2>
                            <ul className="space-y-2">
                                {task.time_entries.map((entry) => (
                                    <li key={entry.id} className="flex justify-between text-sm text-gray-700 py-2 border-b border-gray-50 last:border-0">
                                        <span>{entry.description || '—'}</span>
                                        <span className="text-gray-500">{entry.date}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informationen</h2>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</dt>
                                <dd className="mt-1">
                                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {statusLabels[task.status] || task.status}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priorität</dt>
                                <dd className="mt-1">
                                    <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority] || 'bg-gray-100 text-gray-700'}`}>
                                        {priorityLabels[task.priority] || task.priority}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Zugewiesen an</dt>
                                <dd className="mt-1">
                                    {task.assignees && task.assignees.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {task.assignees.map(a => (
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
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Projekt</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {task.project ? (
                                        <Link href={route('projects.show', task.project.id)} className="hover:text-primary-600">
                                            {task.project.name}
                                        </Link>
                                    ) : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fälligkeitsdatum</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {task.due_date ? new Date(task.due_date).toLocaleDateString('de-DE') : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Erstellt von</dt>
                                <dd className="mt-1 text-sm text-gray-900">{task.creator?.name || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Erstellt am</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {new Date(task.created_at).toLocaleDateString('de-DE')}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
