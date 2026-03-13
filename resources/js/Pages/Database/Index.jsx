import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';

export default function DatabaseIndex() {
    const { auth } = usePage().props;
    const userPermissions = auth?.permissions || {};
    const [searchQuery, setSearchQuery] = useState('');

    // This page should only be accessible if user has database.access permission
    const hasAccess = userPermissions['database.access'];

    if (!hasAccess) {
        return (
            <DashboardLayout title="Zugriff verweigert">
                <Head title="Zugriff verweigert" />
                <PageHeader
                    title="Zugriff verweigert"
                    subtitle="Sie haben keine Berechtigung für diesen Bereich"
                >
                    <EmptyState
                        icon={
                            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        }
                        title="Zugriff verweigert"
                        description="Sie haben keine Berechtigung, auf den Datenbankbereich zuzugreifen."
                        action={false}
                    />
                </PageHeader>
            </DashboardLayout>
        );
    }

    const tables = [
        { name: 'users', rows: 12, size: '128 KB' },
        { name: 'customers', rows: 156, size: '256 KB' },
        { name: 'leads', rows: 89, size: '96 KB' },
        { name: 'projects', rows: 45, size: '64 KB' },
        { name: 'tasks', rows: 234, size: '192 KB' },
        { name: 'invoices', rows: 178, size: '320 KB' },
        { name: 'time_entries', rows: 1245, size: '512 KB' },
        { name: 'audit_logs', rows: 3421, size: '1.2 MB' },
    ];

    // Filter tables based on search
    const filteredTables = tables.filter(table =>
        !searchQuery || table.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout title="Datenbank">
            <Head title="Datenbank" />

            <PageHeader
                title="Datenbank"
                subtitle="Datenbankübersicht und Wartung"
            >
                <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Tabellen suchen..."
                    className="w-48"
                />
            </PageHeader>

            {/* Warning Box */}
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start">
                    <svg className="h-5 w-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <h3 className="text-sm font-medium text-amber-800">Sensibler Bereich</h3>
                        <p className="text-sm text-amber-700 mt-1">
                            Dieser Bereich ist nur für Administratoren zugänglich.
                            Vorsicht bei Datenbankänderungen!
                        </p>
                    </div>
                </div>
            </div>

            {/* Database Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">Tabellen</p>
                    <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">Gesamtzeilen</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {tables.reduce((sum, t) => sum + t.rows, 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">Datenbankgröße</p>
                    <p className="text-2xl font-bold text-gray-900">~2.8 MB</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">Supabase</p>
                    <p className="text-2xl font-bold text-green-600">Verbunden</p>
                </div>
            </div>

            {/* Tables */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Tabellen</h2>
                </div>
                {filteredTables.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tabellenname</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Zeilen</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Größe</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTables.map((table) => (
                                <tr key={table.name} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        <code className="bg-gray-100 px-2 py-1 rounded">{table.name}</code>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 text-right">{table.rows.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 text-right">{table.size}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="secondary" className="text-sm py-1.5">
                                            Ansehen
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <EmptyState
                        title="Keine Tabellen gefunden"
                        description="Keine Tabellen entsprechen Ihrer Suche."
                        action={false}
                    />
                )}
            </div>

            {/* Maintenance */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Wartung</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="secondary" className="w-full justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Cache leeren
                    </Button>
                    <Button variant="secondary" className="w-full justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Datenbank optimieren
                    </Button>
                    <Button variant="secondary" className="w-full justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Backup erstellen
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
