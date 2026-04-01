import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import PageHeader, { Button } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';

export default function DatabaseIndex({ database, tables: dbTables, stats }) {
    const { auth } = usePage().props;
    const userPermissions = auth?.permissions || {};
    const [searchQuery, setSearchQuery] = useState('');
    const [maintenanceAction, setMaintenanceAction] = useState(null);
    const [resultMessage, setResultMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

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

    const handleMaintenance = async (action) => {
        setMaintenanceAction(action);
        setErrorMessage(null);
        setResultMessage(null);

        const routes = {
            cache: 'database.clearCache',
            optimize: 'database.optimize',
            backup: 'database.backup',
        };

        try {
            const response = await axios.post(route(routes[action]));
            const data = response.data;

            if (data.success) {
                setResultMessage(data.message);
            } else {
                setErrorMessage(data.error || 'Unbekannter Fehler');
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.error || err.message || 'Netzwerkfehler');
        } finally {
            setMaintenanceAction(null);
        }
    };

    const filteredTables = (dbTables || []).filter(table =>
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

            {/* Connection Status */}
            {database?.connected ? (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-medium text-green-800">Verbunden mit {database.driver}</h3>
                            <p className="text-xs text-green-600 mt-1">
                                Datenbank: {database.name} | Host: {database.host}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start">
                        <svg className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-medium text-red-800">Datenbank nicht verbunden</h3>
                            <p className="text-xs text-red-600 mt-1">{database?.error || 'Verbindung fehlgeschlagen'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Database Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">Tabellen</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total_tables || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">Gesamtzeilen</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {(stats?.total_rows || 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">Datenbankgröße</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total_size || '0 B'}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">Datenbank</p>
                    <p className="text-2xl font-bold text-green-600">{database?.connected ? database.driver : 'Getrennt'}</p>
                </div>
            </div>

            {/* Tables */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Tabellen</h2>
                </div>
                {filteredTables.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tabellenname</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Zeilen</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Größe</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engine</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTables.map((table) => (
                                    <tr key={table.name} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            <code className="bg-gray-100 px-2 py-1 rounded">{table.name}</code>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 text-right">{(table.rows || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 text-right">{table.size || '0 B'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{table.engine || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        title="Keine Tabellen gefunden"
                        description={searchQuery ? "Keine Tabellen entsprechen Ihrer Suche." : "Datenbank ist leer oder nicht verbunden."}
                        action={false}
                    />
                )}
            </div>

            {/* Maintenance */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Wartung</h2>

                {errorMessage && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-800">Fehler: {errorMessage}</p>
                    </div>
                )}
                {resultMessage && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800">{resultMessage}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={() => handleMaintenance('cache')}
                        disabled={maintenanceAction !== null}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {maintenanceAction === 'cache' ? 'Wird geleert...' : 'Cache leeren'}
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={() => handleMaintenance('optimize')}
                        disabled={maintenanceAction !== null}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {maintenanceAction === 'optimize' ? 'Wird optimiert...' : 'Datenbank optimieren'}
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={() => handleMaintenance('backup')}
                        disabled={maintenanceAction !== null}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        {maintenanceAction === 'backup' ? 'Wird erstellt...' : 'Backup erstellen'}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
