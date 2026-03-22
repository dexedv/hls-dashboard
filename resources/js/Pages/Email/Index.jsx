import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader, { Button } from '@/Components/PageHeader';
import EmptyState from '@/Components/EmptyState';

export default function EmailIndex({ account, folders = [], currentFolder = null, emails = null }) {
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await fetch('/email/sync', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });
            router.reload();
        } catch (error) {
            alert('Sync fehlgeschlagen');
        }
        setSyncing(false);
    };

    // If no account configured, show setup prompt
    if (!account) {
        return (
            <DashboardLayout title="E-Mail">
                <Head title="E-Mail" />

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <EmptyState
                        icon={
                            <svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        }
                        title="E-Mail einrichten"
                        description="Richten Sie Ihr E-Mail-Konto ein, um E-Mails direkt im Dashboard zu lesen und zu senden. Ihre Daten werden verschlüsselt und sind nur für Sie sichtbar."
                        actionLabel="E-Mail-Konto einrichten"
                        onAction={() => router.visit(route('email.settings'))}
                    />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="E-Mail">
            <Head title="E-Mail" />

            <div className="flex h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-gray-100 flex flex-col">
                    {/* Account info */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-primary-600 font-medium">
                                    {account.email.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{account.email}</p>
                                <button
                                    onClick={handleSync}
                                    disabled={syncing}
                                    className="text-xs text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                    {syncing ? 'Synchronisiere...' : 'Jetzt synchronisieren'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Folders */}
                    <nav className="flex-1 overflow-y-auto p-2">
                        {folders.map((folder) => (
                            <Link
                                key={folder.id}
                                href={`/email/folder/${folder.id}`}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    currentFolder?.id === folder.id
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <span>
                                    {folder.name === 'Posteingang' && '📥'}
                                    {folder.name === 'Gesendet' && '📤'}
                                    {folder.name === 'Papierkorb' && '🗑️'}
                                    {folder.name === 'Entwürfe' && '📝'}
                                    {!['Posteingang', 'Gesendet', 'Papierkorb', 'Entwürfe'].includes(folder.name) && '📁'}
                                </span>
                                {folder.name}
                                {folder.unread_count > 0 && (
                                    <span className="ml-auto bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                                        {folder.unread_count}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Settings */}
                    <div className="p-2 border-t border-gray-200">
                        <Link
                            href="/email/settings"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            ⚙️ Einstellungen
                        </Link>
                    </div>
                </div>

                {/* Email List */}
                <div className="flex-1 flex flex-col">
                    {currentFolder ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900">{currentFolder.name}</h2>
                            </div>

                            {/* Email List */}
                            <div className="flex-1 overflow-y-auto">
                                {emails?.data?.length > 0 ? (
                                    <div>
                                        {emails.data.map((email) => (
                                            <Link
                                                key={email.id}
                                                href={`/email/${email.id}`}
                                                className={`flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                                    !email.is_read ? 'bg-blue-50 hover:bg-blue-100' : ''
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!email.is_read ? 'font-semibold' : 'font-normal'}`}>
                                                        {email.from}
                                                    </p>
                                                    <p className={`text-sm truncate ${!email.is_read ? 'font-semibold' : 'text-gray-600'}`}>
                                                        {email.subject || '(Kein Betreff)'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {email.received_at}
                                                    </p>
                                                </div>
                                                {email.is_starred && <span>⭐</span>}
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <span className="text-4xl mb-2">📭</span>
                                        <p>Keine E-Mails vorhanden</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <span className="text-4xl mb-2">👈</span>
                            <p>Wählen Sie einen Ordner aus</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
