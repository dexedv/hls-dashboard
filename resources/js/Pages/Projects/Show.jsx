import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DocumentManager from '@/Components/DocumentManager';

export default function ProjectShow({ project, statuses = [], priorities = [], folders = [] }) {
    const [changingStatus, setChangingStatus] = useState(false);

    const getStatusInfo = (statusValue) => {
        const status = statuses.find(s => s.value === statusValue);
        return status ? { color: status.color, label: status.label } : { color: 'bg-gray-100 text-gray-800', label: statusValue };
    };

    const handleStatusChange = (newStatus) => {
        if (newStatus === project.status) return;
        setChangingStatus(true);
        router.patch(route('projects.updateStatus', project.id), { status: newStatus }, {
            onFinish: () => setChangingStatus(false),
            preserveScroll: true,
        });
    };

    const taskStatusColors = {
        todo:        'bg-gray-100 text-gray-700',
        in_progress: 'bg-blue-100 text-blue-700',
        review:      'bg-yellow-100 text-yellow-700',
        done:        'bg-green-100 text-green-700',
    };
    const taskStatusLabels = {
        todo: 'Offen', in_progress: 'In Bearbeitung', review: 'Überprüfung', done: 'Erledigt',
    };
    const taskPriorityDot = {
        urgent: 'bg-red-500', high: 'bg-orange-400', medium: 'bg-yellow-400', low: 'bg-gray-300',
    };

    const progressColor = project.progress >= 100 ? 'bg-green-500'
        : project.progress >= 60 ? 'bg-primary-500'
        : project.progress >= 30 ? 'bg-yellow-400'
        : 'bg-red-400';

    return (
        <DashboardLayout title={project.name}>
            <Head title={project.name} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/projects" className="hover:text-primary-600">Projekte</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">{project.name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusInfo(project.status).color}`}>
                                {getStatusInfo(project.status).label}
                            </span>
                        </div>
                        {project.customer && (
                            <Link href={route('customers.show', project.customer.id)} className="text-sm text-gray-500 hover:text-primary-600 mt-0.5 inline-block">
                                {project.customer.name}
                            </Link>
                        )}
                    </div>
                </div>
                <Link
                    href={route('projects.edit', project.id)}
                    className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Bearbeiten
                </Link>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Fortschritt</span>
                    <span className={`text-sm font-bold tabular-nums ${project.progress >= 100 ? 'text-green-600' : project.progress >= 60 ? 'text-primary-600' : project.progress >= 30 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {project.progress}%
                    </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${project.progress}%` }}
                    />
                </div>
                {project.tasks && project.tasks.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1.5">
                        {project.tasks.filter(t => t.status === 'done').length} von {project.tasks.length} Aufgaben erledigt
                    </p>
                )}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    {project.description && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-base font-semibold text-gray-900 mb-3">Beschreibung</h2>
                            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{project.description}</p>
                        </div>
                    )}

                    {/* Tasks */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">
                                Aufgaben
                                {project.tasks && project.tasks.length > 0 && (
                                    <span className="ml-2 text-xs font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                                        {project.tasks.length}
                                    </span>
                                )}
                            </h2>
                            <Link href={`/tasks/create?project_id=${project.id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                + Neue Aufgabe
                            </Link>
                        </div>
                        {project.tasks && project.tasks.length > 0 ? (
                            <ul className="divide-y divide-gray-50">
                                {project.tasks.map((task) => (
                                    <li key={task.id}
                                        className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors border-l-4 ${
                                            task.priority === 'urgent' ? 'border-l-red-500' :
                                            task.priority === 'high'   ? 'border-l-orange-400' :
                                            task.priority === 'medium' ? 'border-l-yellow-400' :
                                            'border-l-gray-200'
                                        }`}>
                                        <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${taskPriorityDot[task.priority] ?? 'bg-gray-300'}`} />
                                        <Link href={route('tasks.show', task.id)} className="flex-1 text-sm font-medium text-gray-900 hover:text-primary-600 truncate">
                                            {task.title}
                                        </Link>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {task.due_date && (() => {
                                                const today = new Date(); today.setHours(0,0,0,0);
                                                const due = new Date(task.due_date); due.setHours(0,0,0,0);
                                                const days = Math.round((due - today) / 86400000);
                                                if (days < 0) return <span className="text-xs text-red-600 font-medium">{Math.abs(days)}T überfällig</span>;
                                                if (days === 0) return <span className="text-xs text-orange-600 font-medium">Heute</span>;
                                                if (days <= 3) return <span className="text-xs text-yellow-600">{days}T</span>;
                                                return null;
                                            })()}
                                            {task.assignees && task.assignees.length > 0 && (
                                                <div className="flex -space-x-1">
                                                    {task.assignees.slice(0, 3).map(a => (
                                                        <span key={a.id} title={a.name}
                                                            className="h-5 w-5 rounded-full bg-primary-200 text-primary-800 flex items-center justify-center text-xs font-bold border border-white">
                                                            {a.name?.[0]?.toUpperCase()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${taskStatusColors[task.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {taskStatusLabels[task.status] || task.status}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="px-6 py-8 text-center text-gray-400 text-sm">Noch keine Aufgaben vorhanden.</p>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Project Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Projektdetails</h2>
                        <dl className="space-y-3">
                            {/* Inline Status Change */}
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Status</dt>
                                <dd className="flex flex-wrap gap-1.5">
                                    {statuses.map(s => (
                                        <button
                                            key={s.value}
                                            onClick={() => handleStatusChange(s.value)}
                                            disabled={changingStatus}
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all border ${
                                                project.status === s.value
                                                    ? `${s.color} border-transparent ring-2 ring-offset-1 ring-primary-400`
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            } disabled:opacity-50 cursor-pointer`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </dd>
                            </div>
                            {project.assignees && project.assignees.length > 0 && (
                                <div>
                                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Mitarbeiter</dt>
                                    <dd className="flex flex-wrap gap-1.5">
                                        {project.assignees.map(a => (
                                            <span key={a.id} className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                                                <span className="h-4 w-4 rounded-full bg-primary-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    {a.name?.[0]?.toUpperCase()}
                                                </span>
                                                {a.name}
                                            </span>
                                        ))}
                                    </dd>
                                </div>
                            )}
                            <div className="flex items-center justify-between py-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500">Budget</dt>
                                <dd className="text-sm font-semibold text-gray-900">
                                    {project.budget ? `${parseFloat(project.budget).toLocaleString('de-DE')} €` : '—'}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500">Startdatum</dt>
                                <dd className="text-sm text-gray-900">
                                    {project.start_date ? new Date(project.start_date).toLocaleDateString('de-DE') : '—'}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500">Enddatum</dt>
                                <dd className="text-sm text-gray-900">
                                    {project.end_date ? new Date(project.end_date).toLocaleDateString('de-DE') : '—'}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-gray-50">
                                <dt className="text-sm text-gray-500">Erstellt am</dt>
                                <dd className="text-sm text-gray-900">
                                    {new Date(project.created_at).toLocaleDateString('de-DE')}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <h2 className="text-base font-semibold text-gray-900 mb-3">Schnellaktionen</h2>
                        <div className="space-y-1.5">
                            <Link
                                href={`/tasks/create?project_id=${project.id}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-colors group"
                            >
                                <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200">
                                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700">Aufgabe hinzufügen</span>
                            </Link>
                            <Link
                                href={`/time-tracking?project_id=${project.id}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors group"
                            >
                                <div className="h-7 w-7 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200">
                                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700">Zeit erfassen</span>
                            </Link>
                            <Link
                                href={`/invoices/create?project_id=${project.id}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                            >
                                <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Rechnung erstellen</span>
                            </Link>
                        </div>
                    </div>

                    {/* Documents */}
                    <DocumentManager
                        folders={project.folders ?? []}
                        entityType="App\Models\Project"
                        entityId={project.id}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
