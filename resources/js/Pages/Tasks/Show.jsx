import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import DocumentManager from '@/Components/DocumentManager';

const statusColors = {
    todo:        'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    review:      'bg-yellow-100 text-yellow-700',
    done:        'bg-green-100 text-green-700',
};
const statusLabels = {
    todo: 'Offen', in_progress: 'In Bearbeitung', review: 'Überprüfung', done: 'Erledigt',
};
const priorityColors = {
    low: 'bg-gray-100 text-gray-700', medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700',
};
const priorityLabels = {
    low: 'Niedrig', medium: 'Mittel', high: 'Hoch', urgent: 'Dringend',
};

export default function TaskShow({ task }) {
    const [deleting, setDeleting] = useState(false);
    const [changingStatus, setChangingStatus] = useState(false);

    const handleDelete = () => {
        if (!confirm('Aufgabe wirklich löschen?')) return;
        setDeleting(true);
        router.delete(route('tasks.destroy', task.id));
    };

    const handleStatusChange = (newStatus) => {
        if (newStatus === task.status) return;
        setChangingStatus(true);
        router.patch(route('tasks.updateStatus', task.id), { status: newStatus }, {
            onFinish: () => setChangingStatus(false),
            preserveScroll: true,
        });
    };

    const totalMinutes = task.time_entries?.reduce((sum, e) => {
        if (e.start_time && e.end_time) {
            const start = new Date(`1970-01-01T${e.start_time}`);
            const end   = new Date(`1970-01-01T${e.end_time}`);
            return sum + Math.round((end - start) / 60000);
        }
        if (e.duration) return sum + e.duration;
        return sum;
    }, 0) ?? 0;

    const formatDuration = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <DashboardLayout title={task.title}>
            <Head title={task.title} />

            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/tasks" className="hover:text-primary-600">Aufgaben</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium truncate">{task.title}</span>
            </nav>

            <div className="flex items-start justify-between mb-6 gap-4">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 break-words">{task.title}</h1>
                    {task.project && (
                        <Link href={route('projects.show', task.project.id)} className="text-sm text-gray-500 hover:text-primary-600 mt-0.5 inline-block">
                            {task.project.name}
                        </Link>
                    )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <Link href={route('tasks.edit', task.id)}
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-3">Beschreibung</h2>
                        {task.description ? (
                            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{task.description}</p>
                        ) : (
                            <p className="text-gray-400 text-sm italic">Keine Beschreibung vorhanden.</p>
                        )}
                    </div>

                    {task.time_entries && task.time_entries.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h2 className="text-base font-semibold text-gray-900">Zeiteinträge</h2>
                                {totalMinutes > 0 && (
                                    <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                                        Gesamt: {formatDuration(totalMinutes)}
                                    </span>
                                )}
                            </div>
                            <ul className="divide-y divide-gray-50">
                                {task.time_entries.map((entry) => (
                                    <li key={entry.id} className="flex items-center justify-between px-6 py-3 text-sm">
                                        <span className="text-gray-700 truncate flex-1 mr-4">{entry.description || '—'}</span>
                                        <span className="text-gray-400 flex-shrink-0">{entry.date}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Informationen</h2>
                        <dl className="space-y-3">
                            {/* Inline Status Change */}
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Status</dt>
                                <dd className="flex flex-wrap gap-1.5">
                                    {Object.entries(statusLabels).map(([val, label]) => (
                                        <button
                                            key={val}
                                            onClick={() => handleStatusChange(val)}
                                            disabled={changingStatus}
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all border ${
                                                task.status === val
                                                    ? `${statusColors[val]} border-transparent ring-2 ring-offset-1 ring-primary-400`
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            } disabled:opacity-50 cursor-pointer`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500">Priorität</dt>
                                <dd>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority] || 'bg-gray-100 text-gray-700'}`}>
                                        {priorityLabels[task.priority] || task.priority}
                                    </span>
                                </dd>
                            </div>
                            <div className="pt-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500 mb-1.5">Zugewiesen an</dt>
                                <dd>
                                    {task.assignees && task.assignees.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {task.assignees.map(a => (
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
                                <dt className="text-sm text-gray-500">Projekt</dt>
                                <dd className="text-sm text-gray-900">
                                    {task.project ? (
                                        <Link href={route('projects.show', task.project.id)} className="hover:text-primary-600 font-medium">
                                            {task.project.name}
                                        </Link>
                                    ) : '—'}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500">Fällig am</dt>
                                <dd className="text-sm text-gray-900">
                                    {task.due_date ? (() => {
                                        const today = new Date(); today.setHours(0,0,0,0);
                                        const due = new Date(task.due_date); due.setHours(0,0,0,0);
                                        const days = Math.round((due - today) / 86400000);
                                        const dateStr = due.toLocaleDateString('de-DE');
                                        if (days < 0) return <span className="text-red-600 font-medium">{dateStr}</span>;
                                        if (days <= 1) return <span className="text-orange-600 font-medium">{dateStr}</span>;
                                        return dateStr;
                                    })() : '—'}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500">Erstellt von</dt>
                                <dd className="text-sm text-gray-900">{task.creator?.name || '—'}</dd>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500">Erstellt am</dt>
                                <dd className="text-sm text-gray-900">{new Date(task.created_at).toLocaleDateString('de-DE')}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="mt-6">
                <DocumentManager
                    folders={task.folders ?? []}
                    entityType="App\Models\Task"
                    entityId={task.id}
                />
            </div>
        </DashboardLayout>
    );
}
