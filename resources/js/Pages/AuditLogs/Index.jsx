import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';

export default function AuditLogsIndex({ logs }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('');

    // Filter logs based on search and action
    const filteredLogs = logs?.filter(log => {
        const matchesSearch = !searchQuery ||
            log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAction = !actionFilter || log.action === actionFilter;
        return matchesSearch && matchesAction;
    }) || [];

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
                        <option value="user.login">Login</option>
                        <option value="customer.create">Kunde erstellt</option>
                        <option value="project.create">Projekt erstellt</option>
                    </select>
                </div>
            </PageHeader>

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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(log.created_at).toLocaleString('de-DE')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {log.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {log.user}
                                        </td>
                                    </tr>
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
