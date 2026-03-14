import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';

export default function DatabaseIndex({ database, tables: dbTables, stats }) {
    const { auth } = usePage().props;
    const userPermissions = auth?.permissions || {};
    const [searchQuery, setSearchQuery] = useState('');
    const [sqlQuery, setSqlQuery] = useState('');
    const [queryResult, setQueryResult] = useState(null);
    const [queryError, setQueryError] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [maintenanceAction, setMaintenanceAction] = useState(null);

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

    const executeQuery = async () => {
        if (!sqlQuery.trim()) return;

        setIsExecuting(true);
        setQueryResult(null);
        setQueryError(null);

        try {
            // Get CSRF token from cookie
            const csrfToken = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1]
                ? decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)[1])
                : document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(route('database.execute'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
                body: JSON.stringify({ query: sqlQuery }),
            });

            const data = await response.json();

            if (data.success) {
                setQueryResult(data);
            } else {
                setQueryError(data.error || 'Unbekannter Fehler');
            }
        } catch (err) {
            setQueryError(err.message || 'Netzwerkfehler');
        } finally {
            setIsExecuting(false);
        }
    };

    const handleMaintenance = async (action) => {
        setMaintenanceAction(action);
        setQueryError(null);
        setQueryResult(null);

        const routes = {
            cache: 'database.clearCache',
            optimize: 'database.optimize',
            backup: 'database.backup',
        };

        try {
            // Get CSRF token from cookie
            const csrfToken = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1]
                ? decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)[1])
                : document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(route(routes[action]), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (data.success) {
                setQueryResult(data);
            } else {
                setQueryError(data.error || 'Unbekannter Fehler');
            }
        } catch (err) {
            setQueryError(err.message || 'Netzwerkfehler');
        } finally {
            setMaintenanceAction(null);
        }
    };

    // Filter tables based on search
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

            {/* SQL Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">SQL-Befehl ausführen</h2>
                    <p className="text-sm text-gray-500 mt-1">Führen Sie SQL-Befehle direkt auf der Datenbank aus</p>
                </div>
                <div className="p-6">
                    <textarea
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        placeholder="SELECT * FROM users LIMIT 10;&#10;UPDATE users SET is_approved = 1 WHERE ...&#10;ALTER TABLE users ADD COLUMN ..."
                        className="w-full h-32 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-y"
                    />
                    <div className="mt-4 flex gap-3">
                        <Button
                            onClick={executeQuery}
                            disabled={!sqlQuery.trim() || isExecuting || !database?.connected}
                            variant="primary"
                        >
                            {isExecuting ? 'Wird ausgeführt...' : 'Ausführen'}
                        </Button>
                        <Button
                            onClick={() => {
                                setSqlQuery('');
                                setQueryResult(null);
                                setQueryError(null);
                            }}
                            variant="secondary"
                        >
                            Leeren
                        </Button>
                    </div>

                    {/* Quick Commands */}
                    <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Schnellbefehle:</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSqlQuery('SELECT * FROM users LIMIT 10;')}
                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                Alle Benutzer
                            </button>
                            <button
                                onClick={() => setSqlQuery('SELECT * FROM users WHERE is_approved = 0;')}
                                className="px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-full transition-colors"
                            >
                                Unfreigeschaltete
                            </button>
                            <button
                                onClick={() => setSqlQuery('ALTER TABLE users ADD COLUMN is_approved TINYINT(1) DEFAULT 0;')}
                                className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full transition-colors"
                            >
                                is_approved hinzufügen
                            </button>
                            <button
                                onClick={() => setSqlQuery("UPDATE users SET is_approved = 1 WHERE role IN ('owner', 'admin', 'manager', 'employee');")}
                                className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded-full transition-colors"
                            >
                                Alle freischalten
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {queryError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm font-medium text-red-800">Fehler: {queryError}</p>
                            </div>
                        </div>
                    )}

                    {queryResult && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center mb-2">
                                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-sm font-medium text-green-800">
                                    {queryResult.message || `${queryResult.rows} Zeile(n) gefunden`}
                                </p>
                            </div>
                            {queryResult.data && queryResult.data.length > 0 && (
                                <div className="mt-3 overflow-x-auto">
                                    <pre className="text-xs bg-white p-3 rounded border border-green-100 overflow-x-auto">
                                        {JSON.stringify(queryResult.data, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

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
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
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
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="secondary"
                                                className="text-sm py-1.5"
                                                onClick={() => setSqlQuery(`SELECT * FROM \`${table.name}\` LIMIT 10;`)}
                                            >
                                                Ansehen
                                            </Button>
                                        </td>
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
