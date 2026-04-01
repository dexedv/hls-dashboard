import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';
import { useState } from 'react';

const statusLabels = {
    draft: 'Entwurf',
    sent: 'Gesendet',
    paid: 'Bezahlt',
    overdue: 'Überfällig',
    cancelled: 'Storniert',
};

const statusColors = {
    draft:     'bg-gray-100 text-gray-700',
    sent:      'bg-blue-100 text-blue-700',
    paid:      'bg-green-100 text-green-700',
    overdue:   'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
};

export default function InvoiceShow({ invoice }) {
    const [sending, setSending] = useState(false);
    const [markingPaid, setMarkingPaid] = useState(false);

    const handleSendEmail = () => {
        if (!confirm(`Rechnung ${invoice.number} per E-Mail senden und Status auf "Gesendet" setzen?`)) return;
        setSending(true);
        router.post(route('invoices.sendEmail', invoice.id), {}, {
            onFinish: () => setSending(false),
        });
    };

    const handleMarkPaid = () => {
        if (!confirm(`Rechnung ${invoice.number} als bezahlt markieren?`)) return;
        setMarkingPaid(true);
        router.post(route('invoices.markPaid', invoice.id), {}, {
            onFinish: () => setMarkingPaid(false),
        });
    };

    return (
        <DashboardLayout title="Rechnung">
            <Head title={`Rechnung ${invoice.number}`} />

            <PageHeader
                title={
                    <span className="flex items-center gap-3">
                        {`Rechnung ${invoice.number}`}
                        <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${statusColors[invoice.status] || 'bg-gray-100 text-gray-700'}`}>
                            {statusLabels[invoice.status] || invoice.status}
                        </span>
                    </span>
                }
                actions={
                    <div className="flex flex-wrap gap-2">
                        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <button
                                onClick={handleMarkPaid}
                                disabled={markingPaid}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {markingPaid ? 'Wird gespeichert...' : 'Als bezahlt markieren'}
                            </button>
                        )}
                        <a href={route('invoices.pdf', invoice.id)} target="_blank">
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
                        <Link href={route('invoices.edit', invoice.id)}>
                            <Button variant="secondary">Bearbeiten</Button>
                        </Link>
                        <Link href={route('invoices.index')}>
                            <Button variant="secondary">Zurück</Button>
                        </Link>
                    </div>
                }
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Kunde</dt>
                        <dd className="mt-1 text-gray-900">{invoice.customer?.name || '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Rechnungsdatum</dt>
                        <dd className="mt-1 text-gray-900">{invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('de-DE') : '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Fälligkeitsdatum</dt>
                        <dd className="mt-1 text-gray-900">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('de-DE') : '-'}</dd>
                    </div>
                </dl>
            </div>

            {invoice.items && invoice.items.length > 0 && (
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
                            {invoice.items.map((item, index) => (
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                    {invoice.status === 'paid' && invoice.paid_at && (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Bezahlt am {new Date(invoice.paid_at).toLocaleDateString('de-DE')}
                        </div>
                    )}
                    <dl className="space-y-2 w-full sm:w-72 sm:ml-auto">
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Netto</dt>
                            <dd className="text-sm text-gray-900">{parseFloat(invoice.subtotal || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">MwSt.</dt>
                            <dd className="text-sm text-gray-900">{parseFloat(invoice.tax || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</dd>
                        </div>
                        <div className="flex justify-between pt-3 border-t-2 border-gray-200">
                            <dt className="text-lg font-bold text-gray-900">Gesamt</dt>
                            <dd className="text-lg font-bold text-gray-900">{parseFloat(invoice.total || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {invoice.notes && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Anmerkungen</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
            )}
        </DashboardLayout>
    );
}
