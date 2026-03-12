import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';

export default function DatabaseIndex() {
    const { auth } = usePage().props;
    const userPermissions = auth?.permissions || {};

    // This page should only be accessible if user has database.access permission
    const hasAccess = userPermissions['database.access'];

    if (!hasAccess) {
        return (
            <DashboardLayout title="Zugriff verweigert">
                <Head title="Zugriff verweigert" />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Zugriff verweigert</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Sie haben keine Berechtigung, auf den Datenbankbereich zuzugreifen.
                        </p>
                    </div>
                </div>
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

    return (
        <DashboardLayout title="Datenbank">
            <Head title="Datenbank" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Datenbank</h1>
                <p className="text-sm text-gray-500 mt-1">Datenbankübersicht und Wartung</p>
            </div>

            {/* Warning Box */}
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                    <svg className="h-5 w-5 text-amber-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Tabellen</p>
                    <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Gesamtzeilen</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {tables.reduce((sum, t) => sum + t.rows, 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Datenbankgröße</p>
                    <p className="text-2xl font-bold text-gray-900">~2.8 MB</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Supabase</p>
                    <p className="text-2xl font-bold text-green-600">Verbunden</p>
                </div>
            </div>

            {/* Tables */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Tabellen</h2>
                </div>
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
                        {tables.map((table) => (
                            <tr key={table.name} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    <code className="bg-gray-100 px-2 py-1 rounded">{table.name}</code>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 text-right">{table.rows.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 text-right">{table.size}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-primary-600 hover:text-primary-700 text-sm">
                                        Ansehen
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Maintenance */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Wartung</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                        Cache leeren
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                        Datenbank optimieren
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                        Backup erstellen
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
