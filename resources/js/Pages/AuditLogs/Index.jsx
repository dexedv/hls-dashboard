import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';

// Action type styling
const getActionStyle = (action) => {
    const styles = {
        'user.login': 'bg-green-100 text-green-800',
        'user.logout': 'bg-gray-100 text-gray-800',
        'user.create': 'bg-blue-100 text-blue-800',
        'user.update': 'bg-blue-100 text-blue-800',
        'customer.create': 'bg-purple-100 text-purple-800',
        'customer.update': 'bg-purple-100 text-purple-800',
        'customer.delete': 'bg-red-100 text-red-800',
        'project.create': 'bg-indigo-100 text-indigo-800',
        'project.update': 'bg-indigo-100 text-indigo-800',
        'project.delete': 'bg-red-100 text-red-800',
        'invoice.create': 'bg-yellow-100 text-yellow-800',
        'settings.update': 'bg-orange-100 text-orange-800',
    };
    return styles[action] || 'bg-gray-100 text-gray-800';
};

// Get readable action name
const getActionLabel = (action) => {
    const labels = {
        'user.login': 'Login',
        'user.logout': 'Logout',
        'user.create': 'Benutzer erstellt',
        'user.update': 'Benutzer aktualisiert',
        'customer.create': 'Kunde erstellt',
        'customer.update': 'Kunde aktualisiert',
        'customer.delete': 'Kunde gelöscht',
        'project.create': 'Projekt erstellt',
        'project.update': 'Projekt aktualisiert',
        'project.delete': 'Projekt gelöscht',
        'invoice.create': 'Rechnung erstellt',
        'invoice.update': 'Rechnung aktualisiert',
        'settings.update': 'Einstellungen geändert',
    };
    return labels[action] || action;
};

// Get role badge style
const getRoleStyle = (role) => {
    const styles = {
        'owner': 'bg-purple-100 text-purple-800',
        'admin': 'bg-red-100 text-red-800',
        'manager': 'bg-blue-100 text-blue-800',
        'employee': 'bg-green-100 text-green-800',
        'system': 'bg-gray-100 text-gray-800',
    };
    return styles[role] || 'bg-gray-100 text-gray-800';
};

export default function AuditLogsIndex({ logs }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [expandedLog, setExpandedLog] = useState(null);

    // Filter logs based on search and action
    const filteredLogs = logs?.filter(log => {
        const matchesSearch = !searchQuery ||
            log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAction = !actionFilter || log.action === actionFilter;
        return matchesSearch && matchesAction;
    }) || [];

    // Get unique actions for filter
    const uniqueActions = [...new Set(logs?.map(log => log.action) || [])];

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
                        onChange={setSearchQuery}
                        placeholder="Suchen..."
                        className="w-full sm:w-48"
                    />
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                    >
                        <option value="">Alle Aktionen</option>
                        {uniqueActions.map(action => (
                            <option key={action} value={action}>{getActionLabel(action)}</option>
                        ))}
                    </select>
                </div>
            </PageHeader>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Gesamt Logs</p>
                    <p className="text-2xl font-bold text-gray-900">{logs?.length || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Heute</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {logs?.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length || 0}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Benutzeraktionen</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {logs?.filter(l => l.user_name !== 'System').length || 0}
                    </p>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredLogs.length > 0 ? (
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
                                {filteredLogs.map((log) => (
                                    <>
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
                                                {log.entity_info && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {log.entity_info.type}: {log.entity_info.name}
                                                    </div>
                                                )}
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
                                        {expandedLog === log.id && (
                                            <tr key={`${log.id}-details`} className="bg-gray-50">
                                                <td colSpan={5} className="px-6 py-4">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">IP-Adresse:</span>
                                                            <div className="font-mono text-gray-900">{log.ip_address || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">User-Agent:</span>
                                                            <div className="text-gray-900 truncate max-w-xs" title={log.user_agent}>{log.user_agent || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Entity ID:</span>
                                                            <div className="text-gray-900">{log.entity_id || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Entity Type:</span>
                                                            <div className="text-gray-900">{log.entity_type || '-'}</div>
                                                        </div>
                                                        {log.old_values && (
                                                            <div className="col-span-2">
                                                                <span className="text-gray-500">Alte Werte:</span>
                                                                <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-x-auto">
                                                                    {JSON.stringify(log.old_values, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                        {log.new_values && (
                                                            <div className="col-span-2">
                                                                <span className="text-gray-500">Neue Werte:</span>
                                                                <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-x-auto">
                                                                    {JSON.stringify(log.new_values, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        title="Keine Audit-Logs vorhanden"
                        description={searchQuery || actionFilter ? "Keine Logs entsprechen Ihrer Suche." : "Noch keine Systemaktivitäten wurden protokolliert."}
                        action={false}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
