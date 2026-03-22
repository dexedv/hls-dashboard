import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage, router } from '@inertiajs/react';

export default function EmailSettings({ account }) {
    const { auth } = usePage().props;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const response = await fetch('/email/settings', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: formData,
            });

            if (response.ok) {
                alert('E-Mail-Konto gespeichert!');
                router.visit(route('email.index'));
            } else {
                alert('Fehler beim Speichern');
            }
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    };

    return (
        <DashboardLayout title="E-Mail Einstellungen">
            <Head title="E-Mail Einstellungen" />

            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">E-Mail-Konto einrichten</h1>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-sm text-gray-500 mb-6">
                        Geben Sie Ihre E-Mail-Konto-Daten ein. Ihre Zugangsdaten werden verschlüsselt gespeichert
                        und sind nur für Sie sichtbar.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* IMAP Einstellungen */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">IMAP (Posteingang)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Server</label>
                                    <input
                                        name="imap_host"
                                        defaultValue={account?.imap_host || 'imap.example.com'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                                    <input
                                        name="imap_port"
                                        type="number"
                                        defaultValue={account?.imap_port || 993}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Verschlüsselung</label>
                                    <select
                                        name="imap_encryption"
                                        defaultValue={account?.imap_encryption || 'ssl'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="ssl">SSL</option>
                                        <option value="tls">TLS</option>
                                        <option value="">Keine</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SMTP Einstellungen */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">SMTP (Postausgang)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Server</label>
                                    <input
                                        name="smtp_host"
                                        defaultValue={account?.smtp_host || 'smtp.example.com'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                                    <input
                                        name="smtp_port"
                                        type="number"
                                        defaultValue={account?.smtp_port || 465}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Verschlüsselung</label>
                                    <select
                                        name="smtp_encryption"
                                        defaultValue={account?.smtp_encryption || 'ssl'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="ssl">SSL</option>
                                        <option value="tls">TLS</option>
                                        <option value="">Keine</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Zugangsdaten */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Zugangsdaten</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail-Adresse</label>
                                    <input
                                        name="email"
                                        type="email"
                                        defaultValue={account?.email || ''}
                                        placeholder="ihre@email.de"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Benutzername</label>
                                    <input
                                        name="username"
                                        defaultValue={account?.username || ''}
                                        placeholder="通常 Ihre E-Mail-Adresse"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Passwort / App-Passwort</label>
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder={account?.id ? "••••••••" : "Passwort eingeben"}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        required={!account?.id}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            Konto speichern
                        </button>
                    </form>
                </div>

                {/* Help Box */}
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-6">
                    <h3 className="font-medium text-blue-900 mb-2">Hilfe zu den Einstellungen</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• IMAP und SMTP Server finden Sie in den Einstellungen Ihres E-Mail-Anbieters</li>
                        <li>• Bei Gmail müssen Sie möglicherweise ein "App-Passwort" erstellen</li>
                        <li>• Ihre Daten werden verschlüsselt gespeichert und sind nur für Sie sichtbar</li>
                    </ul>
                </div>
            </div>
        </DashboardLayout>
    );
}
