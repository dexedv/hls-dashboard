import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';

// Icon Components (Heroicons)
const Icons = {
    customers: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    projects: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    ),
    tasks: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    leads: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    // Quick action icons
    newCustomer: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    ),
    newProject: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    newTask: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ),
    newLead: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    timeTrack: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    newTicket: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
    ),
};

export default function Dashboard() {
    const { stats, recentTasks, recentLeads } = usePage().props;

    const statCards = [
        {
            name: 'Kunden',
            value: stats?.customers || 0,
            change: '+12%',
            changeType: 'increase',
            icon: Icons.customers,
            bgColor: 'bg-primary-500',
            gradient: 'from-primary-500 to-primary-600',
        },
        {
            name: 'Aktive Projekte',
            value: stats?.projects || 0,
            change: '+3',
            changeType: 'increase',
            icon: Icons.projects,
            bgColor: 'bg-indigo-500',
            gradient: 'from-indigo-500 to-indigo-600',
        },
        {
            name: 'Offene Aufgaben',
            value: stats?.tasks || 0,
            change: '-5',
            changeType: 'decrease',
            icon: Icons.tasks,
            bgColor: 'bg-amber-500',
            gradient: 'from-amber-500 to-amber-600',
        },
        {
            name: 'Neue Leads',
            value: stats?.leads || 0,
            change: '+8',
            changeType: 'increase',
            icon: Icons.leads,
            bgColor: 'bg-emerald-500',
            gradient: 'from-emerald-500 to-emerald-600',
        },
    ];

    const quickActions = [
        { name: 'Neuer Kunde', href: '/customers/create', icon: Icons.newCustomer },
        { name: 'Neues Projekt', href: '/projects/create', icon: Icons.newProject },
        { name: 'Neue Aufgabe', href: '/tasks/create', icon: Icons.newTask },
        { name: 'Neuer Lead', href: '/leads/create', icon: Icons.newLead },
        { name: 'Zeit erfassen', href: '/time-tracking', icon: Icons.timeTrack },
        { name: 'Neues Ticket', href: '/tickets/create', icon: Icons.newTicket },
    ];

    const getStatusColor = (status) => {
        const colors = {
            new: 'bg-blue-100 text-blue-700 border-blue-200',
            contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            qualified: 'bg-purple-100 text-purple-700 border-purple-200',
            proposal: 'bg-orange-100 text-orange-700 border-orange-200',
            won: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            lost: 'bg-red-100 text-red-700 border-red-200',
            todo: 'bg-gray-100 text-gray-700 border-gray-200',
            in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
            review: 'bg-amber-100 text-amber-700 border-amber-200',
            done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getPriorityStyles = (priority) => {
        const styles = {
            low: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Niedrig' },
            medium: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', label: 'Mittel' },
            high: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500', label: 'Hoch' },
            urgent: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'Dringend' },
        };
        return styles[priority] || styles.low;
    };

    return (
        <DashboardLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {statCards.map((card) => (
                    <div
                        key={card.name}
                        className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 group"
                    >
                        {/* Gradient accent line */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />

                        <div className="flex items-center justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bgColor} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                <div className="text-white">
                                    {card.icon}
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-medium ${
                                card.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                                {card.changeType === 'increase' ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                )}
                                <span>{card.change}</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                            <p className="text-sm font-medium text-gray-500 mt-1">{card.name}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellzugriff</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.name}
                            href={action.href}
                            className="group flex flex-col items-center justify-center p-5 bg-white rounded-xl border border-gray-200 hover:border-primary-400 hover:shadow-lg hover:bg-primary-50/30 transition-all duration-200"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-200 group-hover:scale-110">
                                {action.icon}
                            </div>
                            <span className="mt-3 text-sm font-medium text-gray-700 group-hover:text-primary-700 text-center">
                                {action.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tasks */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Aktuelle Aufgaben</h2>
                            <Link href="/tasks" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                Alle anzeigen
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                    <div className="p-4">
                        {recentTasks && recentTasks.length > 0 ? (
                            <ul className="space-y-2">
                                {recentTasks.map((task) => {
                                    const priorityStyle = getPriorityStyles(task.priority);
                                    return (
                                        <li
                                            key={task.id}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                                        >
                                            <div className="flex items-center min-w-0">
                                                <div className={`h-2 w-2 rounded-full ${priorityStyle.dot} mr-3 flex-shrink-0`} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                                                        {task.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {task.project_name || task.project || 'Kein Projekt'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(task.status)}`}>
                                                    {(task.status || '').replace('_', ' ')}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${priorityStyle.bg} ${priorityStyle.text} font-medium`}>
                                                    {priorityStyle.label}
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500">Keine Aufgaben vorhanden</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Leads */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Neue Leads</h2>
                            <Link href="/leads" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                Alle anzeigen
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                    <div className="p-4">
                        {recentLeads && recentLeads.length > 0 ? (
                            <ul className="space-y-2">
                                {recentLeads.map((lead) => (
                                    <li
                                        key={lead.id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                                    >
                                        <div className="flex items-center min-w-0">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mr-3 flex-shrink-0">
                                                <span className="text-white font-medium text-sm">
                                                    {(lead.name || lead.company || 'L').charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                                                    {lead.name || lead.company}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {lead.value ? lead.value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : 'Kein Wert'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border flex-shrink-0 ml-2 ${getStatusColor(lead.status)}`}>
                                            {lead.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500">Keine Leads vorhanden</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
