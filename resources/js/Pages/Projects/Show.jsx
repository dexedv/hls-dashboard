import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

export default function ProjectShow({ project, statuses = [], priorities = [] }) {
    // Dynamic status lookup from props
    const getStatusInfo = (statusValue) => {
        const status = statuses.find(s => s.value === statusValue);
        return status ? { color: status.color, label: status.label } : { color: 'bg-gray-100 text-gray-800', label: statusValue };
    };

    // Task status fallback (for tasks without prop)
    const taskStatusColors = {
        todo: 'bg-gray-100 text-gray-800',
        in_progress: 'bg-blue-100 text-blue-800',
        review: 'bg-yellow-100 text-yellow-800',
        done: 'bg-green-100 text-green-800',
    };

    return (
        <DashboardLayout title={project.name}>
            <Head title={project.name} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/projects" className="hover:text-primary-600">Projekte</Link>
                <span>/</span>
                <span className="text-gray-900">{project.name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-primary-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                            <span className={`px-3 py-1 text-sm rounded-full ${getStatusInfo(project.status).color}`}>
                                {getStatusInfo(project.status).label}
                            </span>
                        </div>
                        {project.customer && (
                            <Link href={route('customers.show', project.customer.id)} className="text-gray-500 hover:text-primary-600">
                                {project.customer.name}
                            </Link>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={route('projects.edit', project.id)}
                        className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Bearbeiten
                    </Link>
                </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Fortschritt</span>
                    <span className="text-sm font-bold text-gray-900">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-primary-600 h-3 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    {project.description && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Beschreibung</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                        </div>
                    )}

                    {/* Tasks */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Aufgaben</h2>
                            <Link href={`/tasks/create?project_id=${project.id}`} className="text-sm text-primary-600 hover:text-primary-700">
                                + Neue Aufgabe
                            </Link>
                        </div>
                        {project.tasks && project.tasks.length > 0 ? (
                            <ul className="space-y-3">
                                {project.tasks.map((task) => (
                                    <li key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-2 w-2 rounded-full ${
                                                task.status === 'done' ? 'bg-green-500' :
                                                task.status === 'in_progress' ? 'bg-blue-500' :
                                                'bg-gray-300'
                                            }`}></div>
                                            <Link href={route('tasks.show', task.id)} className="font-medium text-gray-900 hover:text-primary-600">
                                                {task.title}
                                            </Link>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${taskStatusColors[task.status]}`}>
                                            {task.status === 'todo' ? 'Offen' :
                                             task.status === 'in_progress' ? 'In Bearbeitung' :
                                             task.status === 'review' ? 'Überprüfung' :
                                             'Erledigt'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">Noch keine Aufgaben vorhanden.</p>
                        )}
                    </div>
                </div>

                {/* Right Column - Stats */}
                <div className="space-y-6">
                    {/* Details Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Projektdetails</h2>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Budget</dt>
                                <dd className="text-xl font-bold text-gray-900">
                                    {project.budget ? `${parseFloat(project.budget).toLocaleString('de-DE')} €` : '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Startdatum</dt>
                                <dd className="text-gray-900">
                                    {project.start_date ? new Date(project.start_date).toLocaleDateString('de-DE') : '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Enddatum</dt>
                                <dd className="text-gray-900">
                                    {project.end_date ? new Date(project.end_date).toLocaleDateString('de-DE') : '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Erstellt am</dt>
                                <dd className="text-gray-900">
                                    {new Date(project.created_at).toLocaleDateString('de-DE', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellaktionen</h2>
                        <div className="space-y-2">
                            <Link
                                href={`/tasks/create?project_id=${project.id}`}
                                className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                            >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Aufgabe hinzufügen
                            </Link>
                            <Link
                                href={`/time-tracking?project_id=${project.id}`}
                                className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                            >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Zeit erfassen
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
