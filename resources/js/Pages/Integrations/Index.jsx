import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader, { Button } from '@/Components/PageHeader';

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
            icon: (
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
            ),
            status: 'connected',
            lastSync: 'Gerade eben',
        },
        {
            id: 'lexware',
            name: 'Lexware Office',
            description: 'Buchhaltung, Rechnungen und Angebote',
            icon: (
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
            status: lexware?.is_configured ? 'connected' : 'disconnected',
            lastSync: lexware?.is_configured ? 'Konfiguriert' : 'Nicht konfiguriert',
        },
        {
            id: 'email',
            name: 'E-Mail',
            description: 'E-Mail-Synchronisation (IMAP/SMTP)',
            icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            status: 'disconnected',
            lastSync: 'Nie',
        },
        {
            id: 'calendar',
            name: 'Kalender',
            description: 'Google Calendar / Outlook Sync',
            icon: (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            status: 'disconnected',
            lastSync: 'Nie',
        },
        {
            id: 'webhooks',
            name: 'Webhooks',
            description: 'Externe Benachrichtigungen',
            icon: (
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            ),
            status: 'disconnected',
            lastSync: 'Nie',
        },
    ];

    return (
        <DashboardLayout title="Integrationen">
            <Head title="Integrationen" />

            <PageHeader
                title="Integrationen"
                subtitle="Verbinden Sie externe Dienste mit Ihrem Dashboard"
            />

            {/* Integration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((integration) => (
                    <div key={integration.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-primary-500 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    {integration.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                                    <p className="text-sm text-gray-500">{integration.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
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
                            <div className="mt-4">
                                <Button variant="secondary" className="w-full">
                                    Konfigurieren
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Lexware Office Section */}
            {canManage && (
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
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
                                        : 'Nicht konfiguriert - API-Schluessel erforderlich'}
                                </p>
                            </div>
                            <Button
                                onClick={testConnection}
                                disabled={!lexware?.is_configured || testingConnection}
                            >
                                {testingConnection ? 'Teste...' : 'Verbindung testen'}
                            </Button>
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
                                Lexware API-Schluessel
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="password"
                                    value={apiKeyData.api_key}
                                    onChange={(e) => setApiKeyData('api_key', e.target.value)}
                                    placeholder="Geben Sie Ihren Lexware API-Schluessel ein"
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                                <Button
                                    onClick={handleSaveApiKey}
                                    disabled={saving || !apiKeyData.api_key}
                                >
                                    {saving ? 'Speichern...' : 'Speichern'}
                                </Button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Sie finden Ihren API-Schluessel in den Einstellungen von Lexware Office.
                            </p>
                        </div>
                    )}

                    {/* Sync Stats */}
                    {lexware?.is_configured && lexware?.stats && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Synchronisierungs-Statistiken</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">{lexware.stats.customers_synced || 0}</p>
                                    <p className="text-xs text-gray-500">Kunden synchronisiert</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-yellow-600">{lexware.stats.customers_pending || 0}</p>
                                    <p className="text-xs text-gray-500">Kunden ausstehend</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">{lexware.stats.invoices_synced || 0}</p>
                                    <p className="text-xs text-gray-500">Rechnungen synchronisiert</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
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
                                    <Button
                                        onClick={syncAllCustomers}
                                        className="flex-1"
                                    >
                                        Alle zu Lexware pushen
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={importCustomers}
                                        className="flex-1"
                                    >
                                        Von Lexware importieren
                                    </Button>
                                </div>
                            </div>

                            {/* Invoices */}
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-3">Rechnungen synchronisieren</h4>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={syncAllInvoices}
                                        className="flex-1"
                                    >
                                        Alle zu Lexware pushen
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={importInvoices}
                                        className="flex-1"
                                    >
                                        Von Lexware importieren
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* API Keys Section */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">API-Zugriff</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    Verwenden Sie API-Schluessel fuer den programmatischen Zugriff auf das Dashboard.
                </p>
                {canManage ? (
                    <Button>
                        Neuen API-Schluessel erstellen
                    </Button>
                ) : (
                    <p className="text-sm text-gray-500 italic">
                        Sie haben keine Berechtigung, API-Schluessel zu verwalten.
                    </p>
                )}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-blue-900">Ueber Integrationen</h3>
                </div>
                <p className="text-sm text-blue-800">
                    Integrationen ermoeglichen die Verbindung mit externen Diensten.
                    Sie koennen E-Mail-Konten synchronisieren, Kalender integrieren und
                    Webhooks fuer Benachrichtigungen nutzen.
                </p>
            </div>
        </DashboardLayout>
    );
}
