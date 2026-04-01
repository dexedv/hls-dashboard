import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';

const priorityColors = {
    urgent: 'bg-red-100 text-red-700',
    high:   'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low:    'bg-gray-100 text-gray-600',
};

const priorityLabel = {
    urgent: 'Dringend',
    high:   'Hoch',
    medium: 'Mittel',
    low:    'Niedrig',
};

const taskStatusLabel = {
    todo:        'Offen',
    in_progress: 'In Arbeit',
    review:      'Review',
    done:        'Erledigt',
};

const ticketStatusLabel = {
    open:        'Offen',
    in_progress: 'In Arbeit',
    waiting:     'Wartet',
    resolved:    'Gelöst',
    closed:      'Geschlossen',
};

const projectStatusLabel = {
    planning:   'Planung',
    active:     'Aktiv',
    on_hold:    'Pausiert',
    completed:  'Abgeschlossen',
    cancelled:  'Abgebrochen',
};

function PriorityBadge({ priority }) {
    if (!priority) return null;
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[priority] || 'bg-gray-100 text-gray-600'}`}>
            {priorityLabel[priority] || priority}
        </span>
    );
}

function EmptyState({ label }) {
    return (
        <p className="text-sm text-gray-400 italic py-3">Keine {label} zugewiesen.</p>
    );
}

function SectionCard({ title, count, children }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-800">{title}</h2>
                {count > 0 && (
                    <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full">{count}</span>
                )}
            </div>
            <div className="divide-y divide-gray-50">
                {children}
            </div>
        </div>
    );
}

export default function MyAssignmentsIndex() {
    const { tasks, tickets, projects } = usePage().props;

    return (
        <DashboardLayout title="Meine Zuweisungen">
            <Head title="Meine Zuweisungen" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Meine Zuweisungen</h1>
                <p className="text-sm text-gray-500 mt-1">Alle offenen Aufgaben, Tickets und Projekte, die dir zugewiesen sind.</p>
            </div>

            <div className="space-y-6">
                {/* Tasks */}
                <SectionCard title="Aufgaben" count={tasks.length}>
                    {tasks.length === 0 ? (
                        <div className="px-6 py-4"><EmptyState label="Aufgaben" /></div>
                    ) : tasks.map(task => (
                        <Link
                            key={task.id}
                            href={route('tasks.show', task.id)}
                            className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                                {task.project && (
                                    <p className="text-xs text-gray-500 mt-0.5">Projekt: {task.project.name}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <PriorityBadge priority={task.priority} />
                                <span className="text-xs text-gray-500">{taskStatusLabel[task.status] || task.status}</span>
                                {task.due_date && (
                                    <span className="text-xs text-gray-400">
                                        {new Date(task.due_date).toLocaleDateString('de-DE')}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </SectionCard>

                {/* Tickets */}
                <SectionCard title="Tickets" count={tickets.length}>
                    {tickets.length === 0 ? (
                        <div className="px-6 py-4"><EmptyState label="Tickets" /></div>
                    ) : tickets.map(ticket => (
                        <Link
                            key={ticket.id}
                            href={route('tickets.show', ticket.id)}
                            className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                                {ticket.customer && (
                                    <p className="text-xs text-gray-500 mt-0.5">Kunde: {ticket.customer.name}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <PriorityBadge priority={ticket.priority} />
                                <span className="text-xs text-gray-500">{ticketStatusLabel[ticket.status] || ticket.status}</span>
                            </div>
                        </Link>
                    ))}
                </SectionCard>

                {/* Projects */}
                <SectionCard title="Projekte" count={projects.length}>
                    {projects.length === 0 ? (
                        <div className="px-6 py-4"><EmptyState label="Projekte" /></div>
                    ) : projects.map(project => (
                        <Link
                            key={project.id}
                            href={route('projects.show', project.id)}
                            className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                                {project.customer && (
                                    <p className="text-xs text-gray-500 mt-0.5">Kunde: {project.customer.name}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <PriorityBadge priority={project.priority} />
                                <span className="text-xs text-gray-500">{projectStatusLabel[project.status] || project.status}</span>
                                {project.end_date && (
                                    <span className="text-xs text-gray-400">
                                        bis {new Date(project.end_date).toLocaleDateString('de-DE')}
                                    </span>
                                )}
                                {project.progress != null && (
                                    <span className="text-xs font-medium text-primary-600">{project.progress}%</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </SectionCard>
            </div>
        </DashboardLayout>
    );
}
