import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';
import { useState } from 'react';

export default function QuoteShow({ quote }) {
    const [sending, setSending] = useState(false);

    const handleSendEmail = () => {
        if (!confirm(`Angebot ${quote.number} per E-Mail senden und Status auf "Gesendet" setzen?`)) return;
        setSending(true);
        router.post(route('quotes.sendEmail', quote.id), {}, {
            onFinish: () => setSending(false),
        });
    };

    return (
        <DashboardLayout title="Angebot">
            <Head title={`Angebot ${quote.number}`} />

            <PageHeader
                title={`Angebot ${quote.number}`}
                subtitle={`Status: ${quote.status}`}
                actions={
                    <div className="flex gap-2">
                        <a href={route('quotes.pdf', quote.id)} target="_blank">
                            <Button variant="secondary">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                PDF
                            </Button>
                        </a>
                        <button
                            onClick={handleSendEmail}
                            disabled={sending}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {sending ? 'Senden...' : 'Per E-Mail senden'}
                        </button>
                        <Link href={route('quotes.edit', quote.id)}>
                            <Button variant="secondary">Bearbeiten</Button>
                        </Link>
                        <Link href={route('quotes.index')}>
                            <Button variant="secondary">Zurück</Button>
                        </Link>
                    </div>
                }
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Kunde</dt>
                        <dd className="mt-1 text-gray-900">{quote.customer?.name || '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Gueltig bis</dt>
                        <dd className="mt-1 text-gray-900">{quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('de-DE') : '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Projekt</dt>
                        <dd className="mt-1 text-gray-900">{quote.project?.name || '-'}</dd>
                    </div>
                </dl>
            </div>

            {quote.items && quote.items.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pos.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beschreibung</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Menge</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Einzelpreis</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gesamt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {quote.items.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 text-right">{parseFloat(item.unit_price).toLocaleString('de-DE', { minimumFractionDigits: 2 })} EUR</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 text-right">{parseFloat(item.total).toLocaleString('de-DE', { minimumFractionDigits: 2 })} EUR</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-end">
                    <dl className="space-y-2 w-64">
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Netto</dt>
                            <dd className="text-sm text-gray-900">{parseFloat(quote.subtotal || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} EUR</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">MwSt.</dt>
                            <dd className="text-sm text-gray-900">{parseFloat(quote.tax || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} EUR</dd>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                            <dt className="text-base font-semibold text-gray-900">Gesamt</dt>
                            <dd className="text-base font-semibold text-gray-900">{parseFloat(quote.total || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} EUR</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {quote.notes && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Anmerkungen</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">{quote.notes}</p>
                </div>
            )}
        </DashboardLayout>
    );
}
