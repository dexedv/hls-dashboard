import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const navigation = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        permission: 'dashboard.view',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },

    // Vertrieb
    { name: 'Vertrieb', isHeader: true, permission: 'vertrieb' },
    { name: 'Kunden (CRM)', href: '/customers', permission: 'crm.view', icon: '👥' },
    { name: 'Leads', href: '/leads', permission: 'leads.view', icon: '🎯' },
    { name: 'Angebote', href: '/quotes', permission: 'quotes.view', icon: '📝' },
    { name: 'Rechnungen', href: '/invoices', permission: 'invoices.view', icon: '💰' },
    { name: 'Finanzen', href: '/finances', permission: 'finances.view', icon: '📊' },

    // Projekte
    { name: 'Projekte', isHeader: true, permission: 'projekte' },
    { name: 'Alle Projekte', href: '/projects', permission: 'projects.view', icon: '📁' },
    { name: 'Aufgaben', href: '/tasks', permission: 'tasks.view', icon: '✓' },
    { name: 'Zeiterfassung', href: '/time-tracking', permission: 'time_tracking.view', icon: '⏱️' },

    // Kalender & Zeit
    { name: 'Kalender & Zeit', isHeader: true, permission: 'kalender' },
    { name: 'Kalender', href: '/calendar', permission: 'calendar.view', icon: '📅' },
    { name: 'Urlaub', href: '/vacation', permission: 'leave.view', icon: '🏖️' },

    // Kommunikation
    { name: 'Kommunikation', isHeader: true, permission: 'kommunikation' },
    { name: 'Notizen', href: '/notes', permission: 'notes.view', icon: '📒' },
    { name: 'Tickets', href: '/tickets', permission: 'tickets.view', icon: '🎫' },
    { name: 'E-Mail', href: '/email', permission: 'email.view', icon: '📧' },

    // Lager & Inventar
    { name: 'Lager & Inventar', isHeader: true, permission: 'lager' },
    { name: 'Inventar', href: '/inventory', permission: 'inventory.view', icon: '📦' },
    { name: 'Warenwirtschaft', href: '/warehouse', permission: 'wms.view', icon: '🏭' },

    // Tools
    { name: 'Tools', isHeader: true, permission: 'tools' },
    { name: 'Barcode', href: '/barcode', permission: 'barcode.view', icon: '📱' },
    { name: 'Statistiken', href: '/statistics', permission: 'statistics.view', icon: '📈' },

    // Team
    { name: 'Team', isHeader: true, permission: 'team' },
    { name: 'Mitarbeiter', href: '/team', permission: 'team.view', icon: '👥' },

    // System (Admin)
    { name: 'System', isHeader: true, permission: 'system' },
    { name: 'Einstellungen', href: '/settings', permission: 'settings.view', icon: '⚙️' },
    { name: 'Benutzer', href: '/users', permission: 'users.view', icon: '👤' },
    { name: 'Rollen & Rechte', href: '/roles', permission: 'roles.view', icon: '🔐' },
    { name: 'Labels', href: '/labels', permission: 'labels.view', icon: '🏷️' },
    { name: 'Audit Logs', href: '/audit-logs', permission: 'audit_logs.view', icon: '📋' },
    { name: 'Integrationen', href: '/integrations', permission: 'integrations.view', icon: '🔌' },
    { name: 'Datenbank', href: '/database', permission: 'database.access', icon: '🗄️' },
];

export default function DashboardLayout({ children, title }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const permissions = auth?.permissions || {};
    const userRole = auth?.user?.role || 'employee';

    // Filter navigation based on permissions
    const filteredNavigation = navigation.filter(item => {
        if (item.isHeader) return true;
        if (!item.permission) return true;
        // Headers with specific permissions (groups)
        if (item.name === 'Vertrieb' && !permissions['crm.view'] && !permissions['leads.view'] && !permissions['invoices.view'] && !permissions['quotes.view'] && !permissions['finances.view']) return false;
        if (item.name === 'Projekte' && !permissions['projects.view'] && !permissions['tasks.view'] && !permissions['time_tracking.view']) return false;
        if (item.name === 'Kalender & Zeit' && !permissions['calendar.view'] && !permissions['leave.view']) return false;
        if (item.name === 'Kommunikation' && !permissions['notes.view'] && !permissions['tickets.view'] && !permissions['email.view']) return false;
        if (item.name === 'Lager & Inventar' && !permissions['inventory.view'] && !permissions['wms.view']) return false;
        if (item.name === 'Tools' && !permissions['barcode.view'] && !permissions['statistics.view']) return false;
        if (item.name === 'Team' && !permissions['team.view']) return false;
        if (item.name === 'System' && userRole !== 'owner' && userRole !== 'admin' && !permissions['settings.view'] && !permissions['users.view'] && !permissions['roles.view'] && !permissions['labels.view'] && !permissions['audit_logs.view'] && !permissions['integrations.view'] && !permissions['database.access']) return false;
        // Check individual permissions
        if (item.permission && !permissions[item.permission] && userRole !== 'owner' && userRole !== 'admin') {
            return false;
        }
        return true;
    });

    // Group navigation by headers
    const groupedNavigation = [];
    let currentGroup = [];
    filteredNavigation.forEach(item => {
        if (item.isHeader) {
            if (currentGroup.length > 0) {
                groupedNavigation.push(currentGroup);
            }
            currentGroup = [item];
        } else {
            currentGroup.push(item);
        }
    });
    if (currentGroup.length > 0) {
        groupedNavigation.push(currentGroup);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                            <span className="text-xl font-bold text-white">H</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">HLS</span>
                    </Link>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <ul className="space-y-1">
                        {groupedNavigation.map((group, groupIndex) => (
                            <li key={groupIndex}>
                                {group.map((item) => (
                                    <div key={item.name}>
                                        {item.isHeader ? (
                                            <div className="px-3 py-3 text-xs font-bold text-primary-600 bg-primary-50 rounded-md uppercase tracking-wider mt-4 first:mt-0 mx-2">
                                                {item.name}
                                            </div>
                                        ) : item.href ? (
                                            <Link
                                                href={item.href}
                                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                            >
                                                <span className="text-lg">{item.icon}</span>
                                                {item.name}
                                            </Link>
                                        ) : null}
                                    </div>
                                ))}
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
                {/* Top header */}
                <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex flex-1 items-center">
                            <h1 className="text-lg font-semibold text-gray-900">{title || 'Dashboard'}</h1>
                        </div>
                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            {/* Notifications */}
                            <button type="button" className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                                <span className="sr-only">View notifications</span>
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>

                            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

                            {/* User info */}
                            <div className="flex items-center gap-3">
                                <img
                                    className="h-8 w-8 rounded-full bg-gray-50"
                                    src={auth.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=0ea5e9&color=fff`}
                                    alt=""
                                />
                                <span className="text-sm font-medium text-gray-900">
                                    {auth.user.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
