import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';

export default function InvoiceShow({ invoice }) {
    const { post: sendEmail, processing: emailProcessing } = useForm();

    const handleSendEmail = () => {
        sendEmail(route('invoices.sendEmail', invoice.id));
    };

    return (
        <DashboardLayout title="Rechnung">
            <Head title={`Rechnung ${invoice.number}`} />

            <PageHeader
                title={`Rechnung ${invoice.number}`}
                subtitle={`Status: ${invoice.status}`}
                actions={
                    <div className="flex gap-2">
                        <a href={route('invoices.pdf', invoice.id)} target="_blank">
                            <Button variant="secondary">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                PDF
                            </Button>
                        </a>
                        <Button variant="secondary" onClick={handleSendEmail} disabled={emailProcessing}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Per E-Mail senden
                        </Button>
                        <Link href={route('invoices.edit', invoice.id)}>
                            <Button variant="secondary">Bearbeiten</Button>
                        </Link>
                        <Link href={route('invoices.index')}>
                            <Button variant="secondary">Zurueck</Button>
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
                        <dt className="text-sm font-medium text-gray-500">Faelligkeitsdatum</dt>
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
                <div className="flex justify-end">
                    <dl className="space-y-2 w-64">
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Netto</dt>
                            <dd className="text-sm text-gray-900">{parseFloat(invoice.subtotal || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} EUR</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">MwSt.</dt>
                            <dd className="text-sm text-gray-900">{parseFloat(invoice.tax || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} EUR</dd>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                            <dt className="text-base font-semibold text-gray-900">Gesamt</dt>
                            <dd className="text-base font-semibold text-gray-900">{parseFloat(invoice.total || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} EUR</dd>
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
