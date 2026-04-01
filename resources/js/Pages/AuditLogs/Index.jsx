import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

const getActionStyle = (action) => {
    if (!action) return 'bg-gray-100 text-gray-800';
    if (action.includes('.created')) return 'bg-green-100 text-green-800';
    if (action.includes('.updated')) return 'bg-blue-100 text-blue-800';
    if (action.includes('.deleted')) return 'bg-red-100 text-red-800';
    if (action.includes('login')) return 'bg-green-100 text-green-800';
    if (action.includes('logout')) return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
};

const getActionLabel = (action) => {
    if (!action) return 'Unbekannt';
    const parts = action.split('.');
    const model = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : '';
    const event = parts[1] || '';
    const eventLabels = {
        created: 'erstellt',
        updated: 'aktualisiert',
        deleted: 'gelöscht',
        login: 'Login',
        logout: 'Logout',
    };
    return `${model} ${eventLabels[event] || event}`;
};

const getRoleStyle = (role) => {
    const styles = {
        owner: 'bg-purple-100 text-purple-800',
        admin: 'bg-red-100 text-red-800',
        manager: 'bg-blue-100 text-blue-800',
        employee: 'bg-green-100 text-green-800',
        system: 'bg-gray-100 text-gray-800',
    };
    return styles[role] || 'bg-gray-100 text-gray-800';
};

export default function AuditLogsIndex({ logs, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [expandedLog, setExpandedLog] = useState(null);

    const logsData = logs?.data || [];

    const handleSearch = (value) => {
        setSearchQuery(value);
        router.get(route('audit_logs.index'), { search: value || undefined, action: filters?.action || undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <DashboardLayout title="Audit Logs">
            <Head title="Audit Logs" />

            <PageHeader
                title="Audit Logs"
                subtitle="Nachvollziehbarkeit aller Systemaktivitäten"
            >
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                    <SearchInput
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Suchen..."
                        className="w-full sm:w-48"
                    />
                </div>
            </PageHeader>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Gesamt Logs</p>
                    <p className="text-2xl font-bold text-gray-900">{logs?.total || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Heute</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {logsData.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length || 0}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Aktuelle Seite</p>
                    <p className="text-2xl font-bold text-gray-900">{logsData.length}</p>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {logsData.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zeit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktion</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beschreibung</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Benutzer</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {logsData.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>{new Date(log.created_at).toLocaleDateString('de-DE')}</div>
                                                <div className="text-xs text-gray-400">{new Date(log.created_at).toLocaleTimeString('de-DE')}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getActionStyle(log.action)}`}>
                                                    {getActionLabel(log.action)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                                <div className="truncate" title={log.description}>
                                                    {log.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                                                        {log.user_name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">{log.user_name}</div>
                                                        <div className="text-xs text-gray-500">{log.user_email}</div>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getRoleStyle(log.user_role)}`}>
                                                            {log.user_role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                                    className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                                                >
                                                    {expandedLog === log.id ? 'Ausblenden' : 'Details'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={logs?.links}
                            from={logs?.from}
                            to={logs?.to}
                            total={logs?.total}
                            entityName="Logs"
                        />
                    </>
                ) : (
                    <EmptyState
                        title="Keine Audit-Logs vorhanden"
                        description={filters?.search ? "Keine Logs entsprechen Ihrer Suche." : "Noch keine Systemaktivitäten wurden protokolliert."}
                        action={false}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
