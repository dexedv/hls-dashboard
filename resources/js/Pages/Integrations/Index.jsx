import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function IntegrationsIndex() {
    const { auth, lexware } = usePage().props;
    const userPermissions = auth?.permissions || {};
    const canManage = userPermissions['integrations.manage'];

    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);

    const { data: apiKeyData, setData: setApiKeyData, post: saveApiKey, processing: saving } = useForm({
        api_key: '',
    });

    const testConnection = async () => {
        setTestingConnection(true);
        setConnectionStatus(null);
        try {
            const response = await fetch('/lexware/test', {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
            });
            const result = await response.json();
            setConnectionStatus(result);
        } catch (error) {
            setConnectionStatus({ success: false, message: error.message });
        }
        setTestingConnection(false);
    };

    const handleSaveApiKey = async () => {
        try {
            const response = await fetch('/lexware/save-api-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify(apiKeyData),
            });
            const result = await response.json();
            setConnectionStatus(result);
            if (result.success) {
                window.location.reload();
            }
        } catch (error) {
            setConnectionStatus({ success: false, message: error.message });
        }
    };

    const syncAllCustomers = async () => {
        try {
            const response = await fetch('/lexware/customers/sync-all', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
            });
            const result = await response.json();
            alert(`Kunden synchronisiert: ${result.synced} erfolgreich, ${result.failed} fehlgeschlagen`);
            if (result.success) window.location.reload();
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    };

    const syncAllInvoices = async () => {
        try {
            const response = await fetch('/lexware/invoices/sync-all', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
            });
            const result = await response.json();
            alert(`Rechnungen synchronisiert: ${result.synced} erfolgreich, ${result.failed} fehlgeschlagen`);
            if (result.success) window.location.reload();
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    };

    const syncAllQuotes = async () => {
        try {
            const response = await fetch('/lexware/quotes/sync-all', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
            });
            const result = await response.json();
            alert(`Angebote synchronisiert: ${result.synced} erfolgreich, ${result.failed} fehlgeschlagen`);
            if (result.success) window.location.reload();
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    };

    const importCustomers = async () => {
        try {
            const response = await fetch('/lexware/customers/import', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
            });
            const result = await response.json();
            alert(`Kunden importiert: ${result.imported}`);
            if (result.success) window.location.reload();
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    };

    const importInvoices = async () => {
        try {
            const response = await fetch('/lexware/invoices/import', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
            });
            const result = await response.json();
            alert(`Rechnungen importiert: ${result.imported}`);
            if (result.success) window.location.reload();
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    };

    const integrations = [
        {
            id: 'supabase',
            name: 'Supabase',
            description: 'Datenbank und Authentifizierung',
            icon: '🗄️',
            status: 'connected',
            lastSync: 'Gerade eben',
        },
        {
            id: 'lexware',
            name: 'Lexware Office',
            description: 'Buchhaltung, Rechnungen und Angebote',
            icon: '📊',
            status: lexware?.is_configured ? 'connected' : 'disconnected',
            lastSync: lexware?.is_configured ? 'Konfiguriert' : 'Nicht konfiguriert',
        },
        {
            id: 'email',
            name: 'E-Mail',
            description: 'E-Mail-Synchronisation (IMAP/SMTP)',
            icon: '📧',
            status: 'disconnected',
            lastSync: 'Nie',
        },
        {
            id: 'calendar',
            name: 'Kalender',
            description: 'Google Calendar / Outlook Sync',
            icon: '📅',
            status: 'disconnected',
            lastSync: 'Nie',
        },
        {
            id: 'webhooks',
            name: 'Webhooks',
            description: 'Externe Benachrichtigungen',
            icon: '🔗',
            status: 'disconnected',
            lastSync: 'Nie',
        },
    ];

    return (
        <DashboardLayout title="Integrationen">
            <Head title="Integrationen" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Integrationen</h1>
                <p className="text-sm text-gray-500 mt-1">Verbinden Sie externe Dienste mit Ihrem Dashboard</p>
            </div>

            {/* Integration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((integration) => (
                    <div key={integration.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">{integration.icon}</div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                                    <p className="text-sm text-gray-500">{integration.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                {integration.status === 'connected' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <span className="w-1.5 h-1.5 mr-1.5 bg-green-500 rounded-full"></span>
                                        Verbunden
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        <span className="w-1.5 h-1.5 mr-1.5 bg-gray-400 rounded-full"></span>
                                        Nicht verbunden
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500">
                                {integration.status === 'connected' ? `Sync: ${integration.lastSync}` : ''}
                            </span>
                        </div>

                        {canManage && integration.id === 'lexware' && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    Konfigurieren
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Lexware Office Section */}
            {canManage && (
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-3xl">📊</div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Lexware Office Integration</h2>
                            <p className="text-sm text-gray-500">Synchronisieren Sie Kunden, Rechnungen und Angebote</p>
                        </div>
                    </div>

                    {/* Connection Status */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Verbindungsstatus</p>
                                <p className="text-sm text-gray-500">
                                    {lexware?.is_configured
                                        ? 'Mit Lexware Office verbunden'
                                        : 'Nicht konfiguriert - API-Schlüssel erforderlich'}
                                </p>
                            </div>
                            <button
                                onClick={testConnection}
                                disabled={!lexware?.is_configured || testingConnection}
                                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                            >
                                {testingConnection ? 'Teste...' : 'Verbindung testen'}
                            </button>
                        </div>
                        {connectionStatus && (
                            <div className={`mt-3 p-3 rounded-lg ${connectionStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                {connectionStatus.message || (connectionStatus.success ? 'Verbindung erfolgreich!' : 'Verbindung fehlgeschlagen')}
                            </div>
                        )}
                    </div>

                    {/* API Key Configuration */}
                    {!lexware?.is_configured && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lexware API-Schlüssel
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="password"
                                    value={apiKeyData.api_key}
                                    onChange={(e) => setApiKeyData('api_key', e.target.value)}
                                    placeholder="Geben Sie Ihren Lexware API-Schlüssel ein"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                                <button
                                    onClick={handleSaveApiKey}
                                    disabled={saving || !apiKeyData.api_key}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                >
                                    {saving ? 'Speichern...' : 'Speichern'}
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Sie finden Ihren API-Schlüssel in den Einstellungen von Lexware Office.
                            </p>
                        </div>
                    )}

                    {/* Sync Stats */}
                    {lexware?.is_configured && lexware?.stats && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Synchronisierungs-Statistiken</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">{lexware.stats.customers_synced || 0}</p>
                                    <p className="text-xs text-gray-500">Kunden synchronisiert</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-yellow-600">{lexware.stats.customers_pending || 0}</p>
                                    <p className="text-xs text-gray-500">Kunden ausstehend</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">{lexware.stats.invoices_synced || 0}</p>
                                    <p className="text-xs text-gray-500">Rechnungen synchronisiert</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">{lexware.stats.quotes_synced || 0}</p>
                                    <p className="text-xs text-gray-500">Angebote synchronisiert</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sync Actions */}
                    {lexware?.is_configured && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Customers */}
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-3">Kunden synchronisieren</h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={syncAllCustomers}
                                        className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                    >
                                        Alle zu Lexware pushen
                                    </button>
                                    <button
                                        onClick={importCustomers}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Von Lexware importieren
                                    </button>
                                </div>
                            </div>

                            {/* Invoices */}
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-3">Rechnungen synchronisieren</h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={syncAllInvoices}
                                        className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                    >
                                        Alle zu Lexware pushen
                                    </button>
                                    <button
                                        onClick={importInvoices}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Von Lexware importieren
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* API Keys Section */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">API-Zugriff</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Verwenden Sie API-Schlüssel für den programmatischen Zugriff auf das Dashboard.
                </p>
                {canManage ? (
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                        Neuen API-Schlüssel erstellen
                    </button>
                ) : (
                    <p className="text-sm text-gray-500 italic">
                        Sie haben keine Berechtigung, API-Schlüssel zu verwalten.
                    </p>
                )}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Über Integrationen</h3>
                <p className="text-sm text-blue-800">
                    Integrationen ermöglichen die Verbindung mit externen Diensten.
                    Sie können E-Mail-Konten synchronisieren, Kalender integrieren und
                    Webhooks für Benachrichtigungen nutzen.
                </p>
            </div>
        </DashboardLayout>
    );
}
