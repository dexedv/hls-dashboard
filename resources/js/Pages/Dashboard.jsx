import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { stats, recentTasks, recentLeads } = usePage().props;

    const statCards = [
        {
            name: 'Kunden',
            value: stats?.customers || 0,
            change: '+12%',
            changeType: 'increase',
            icon: (
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            bgColor: 'bg-primary-500',
        },
        {
            name: 'Aktive Projekte',
            value: stats?.projects || 0,
            change: '+3',
            changeType: 'increase',
            icon: (
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            bgColor: 'bg-indigo-500',
        },
        {
            name: 'Offene Aufgaben',
            value: stats?.tasks || 0,
            change: '-5',
            changeType: 'decrease',
            icon: (
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            bgColor: 'bg-amber-500',
        },
        {
            name: 'Neue Leads',
            value: stats?.leads || 0,
            change: '+8',
            changeType: 'increase',
            icon: (
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
            bgColor: 'bg-green-500',
        },
    ];

    const getStatusColor = (status) => {
        const colors = {
            new: 'bg-blue-100 text-blue-800',
            contacted: 'bg-yellow-100 text-yellow-800',
            qualified: 'bg-purple-100 text-purple-800',
            proposal: 'bg-orange-100 text-orange-800',
            won: 'bg-green-100 text-green-800',
            lost: 'bg-red-100 text-red-800',
            todo: 'bg-gray-100 text-gray-800',
            in_progress: 'bg-blue-100 text-blue-800',
            review: 'bg-amber-100 text-amber-800',
            done: 'bg-green-100 text-green-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'text-gray-500',
            medium: 'text-yellow-500',
            high: 'text-orange-500',
            urgent: 'text-red-500',
        };
        return colors[priority] || 'text-gray-500';
    };

    return (
        <DashboardLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {statCards.map((card) => (
                    <div key={card.name} className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor}`}>
                                {card.icon}
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">{card.name}</p>
                                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className={`text-sm font-medium ${card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                {card.change}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellzugriff</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                        { name: 'Neuer Kunde', href: '/customers/create', icon: '👤' },
                        { name: 'Neues Projekt', href: '/projects/create', icon: '📁' },
                        { name: 'Neue Aufgabe', href: '/tasks/create', icon: '✓' },
                        { name: 'Neuer Lead', href: '/leads/create', icon: '🎯' },
                        { name: 'Zeit erfassen', href: '/time-tracking', icon: '⏱️' },
                        { name: 'Neues Ticket', href: '/tickets/create', icon: '🎫' },
                    ].map((action) => (
                        <Link
                            key={action.name}
                            href={action.href}
                            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-md transition"
                        >
                            <span className="text-2xl mb-2">{action.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{action.name}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tasks */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Aktuelle Aufgaben</h2>
                            <Link href="/tasks" className="text-sm text-primary-600 hover:text-primary-700">Alle anzeigen</Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {recentTasks && recentTasks.length > 0 ? (
                            <ul className="space-y-4">
                                {recentTasks.map((task) => (
                                    <li key={task.id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="h-2 w-2 rounded-full bg-primary-500 mr-3"></div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                                <p className="text-xs text-gray-500">{task.project_name || task.project || 'Kein Projekt'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                                                {task.status?.replace('_', ' ') || task.status}
                                            </span>
                                            <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                                                {task.priority === 'urgent' && '●●●'}
                                                {task.priority === 'high' && '●●○'}
                                                {task.priority === 'medium' && '●○○'}
                                                {task.priority === 'low' && '○○○'}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">Keine Aufgaben vorhanden</p>
                        )}
                    </div>
                </div>

                {/* Recent Leads */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Neue Leads</h2>
                            <Link href="/leads" className="text-sm text-primary-600 hover:text-primary-700">Alle anzeigen</Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {recentLeads && recentLeads.length > 0 ? (
                            <ul className="space-y-4">
                                {recentLeads.map((lead) => (
                                    <li key={lead.id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                                                <span className="text-primary-600 font-medium">{(lead.name || lead.company || 'L').charAt(0)}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{lead.name || lead.company}</p>
                                                <p className="text-xs text-gray-500">{lead.value ? lead.value.toLocaleString('de-DE') + ' €' : '0 €'}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lead.status)}`}>
                                            {lead.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">Keine Leads vorhanden</p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
