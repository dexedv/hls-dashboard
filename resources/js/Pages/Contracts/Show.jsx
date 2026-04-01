import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';

const STATUS_COLORS = { draft: 'bg-gray-100 text-gray-600', active: 'bg-green-100 text-green-700', expired: 'bg-red-100 text-red-700', terminated: 'bg-orange-100 text-orange-700' };
const STATUS_LABELS = { draft: 'Entwurf', active: 'Aktiv', expired: 'Abgelaufen', terminated: 'Gekündigt' };
const TYPE_LABELS = { service: 'Dienstleistung', nda: 'NDA', purchase: 'Kauf', rental: 'Miete', other: 'Sonstiges' };

export default function ContractShow({ contract }) {
    const daysLeft = contract.end_date
        ? Math.ceil((new Date(contract.end_date) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <DashboardLayout title={contract.title}>
            <Head title={contract.title} />
            <PageHeader
                title={contract.title}
                subtitle={contract.number || 'Vertrag'}
                actions={
                    <div className="flex gap-2">
                        <Link href={route('contracts.edit', contract.id)}><Button variant="secondary">Bearbeiten</Button></Link>
                        <Button variant="danger" onClick={() => { if (confirm('Vertrag löschen?')) router.delete(route('contracts.destroy', contract.id)); }}>Löschen</Button>
                    </div>
                }
            />

            {daysLeft !== null && daysLeft >= 0 && daysLeft <= 30 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <p className="text-amber-700 text-sm font-medium">⚠ Dieser Vertrag läuft in {daysLeft} Tag{daysLeft !== 1 ? 'en' : ''} ab.</p>
                </div>
            )}

            <div className="max-w-2xl space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div>
                            <p className="text-gray-500">Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${STATUS_COLORS[contract.status] || 'bg-gray-100 text-gray-600'}`}>
                                {STATUS_LABELS[contract.status] || contract.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-gray-500">Typ</p>
                            <p className="font-medium mt-0.5">{TYPE_LABELS[contract.type] || contract.type || '—'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Wert</p>
                            <p className="text-xl font-bold text-gray-900 mt-0.5">
                                {contract.value ? Number(contract.value).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' ' + contract.currency : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Vertragsnr.</p>
                            <p className="font-medium font-mono mt-0.5">{contract.number || '—'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Startdatum</p>
                            <p className="font-medium mt-0.5">{contract.start_date ? new Date(contract.start_date).toLocaleDateString('de-DE') : '—'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Enddatum</p>
                            <p className={`font-medium mt-0.5 ${daysLeft !== null && daysLeft <= 30 && daysLeft >= 0 ? 'text-amber-600' : ''}`}>
                                {contract.end_date ? new Date(contract.end_date).toLocaleDateString('de-DE') : '—'}
                            </p>
                        </div>
                        {contract.customer && (
                            <div>
                                <p className="text-gray-500">Kunde</p>
                                <Link href={route('customers.show', contract.customer.id)} className="font-medium text-primary-600 hover:underline mt-0.5 block">{contract.customer.name}</Link>
                            </div>
                        )}
                        {contract.project && (
                            <div>
                                <p className="text-gray-500">Projekt</p>
                                <Link href={route('projects.show', contract.project.id)} className="font-medium text-primary-600 hover:underline mt-0.5 block">{contract.project.name}</Link>
                            </div>
                        )}
                    </div>

                    {contract.description && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Beschreibung</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.description}</p>
                        </div>
                    )}
                    {contract.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Notizen</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.notes}</p>
                        </div>
                    )}
                </div>

                {/* Attachments */}
                {contract.attachments && contract.attachments.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Anhänge ({contract.attachments.length})</h3>
                        <div className="space-y-2">
                            {contract.attachments.map(a => (
                                <div key={a.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-700">{a.original_name}</span>
                                    <a href={route('attachments.download', a.id)} className="text-xs text-primary-600 hover:underline">Herunterladen</a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
