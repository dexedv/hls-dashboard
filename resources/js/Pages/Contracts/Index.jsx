import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

const STATUS_COLORS = { draft: 'bg-gray-100 text-gray-600', active: 'bg-green-100 text-green-700', expired: 'bg-red-100 text-red-700', terminated: 'bg-orange-100 text-orange-700' };
const STATUS_LABELS = { draft: 'Entwurf', active: 'Aktiv', expired: 'Abgelaufen', terminated: 'Gekündigt' };
const TYPE_LABELS = { service: 'Dienstleistung', nda: 'NDA', purchase: 'Kauf', rental: 'Miete', other: 'Sonstiges' };

export default function ContractsIndex({ contracts, filters, expiringCount }) {
    const [search, setSearch] = useState(filters?.search || '');

    const navigate = (params) => {
        router.get(route('contracts.index'), { ...filters, ...params }, { preserveScroll: true });
    };

    return (
        <DashboardLayout title="Verträge">
            <Head title="Verträge" />
            <PageHeader
                title="Verträge"
                subtitle="Vertragsverwaltung"
                actions={
                    <Link href={route('contracts.create')}>
                        <Button variant="primary">+ Neuer Vertrag</Button>
                    </Link>
                }
            />

            {expiringCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <span className="text-amber-600 font-medium text-sm">⚠ {expiringCount} Vertrag{expiringCount > 1 ? 'e' : ''} läuft in den nächsten 30 Tagen ab.</span>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
                <form onSubmit={e => { e.preventDefault(); navigate({ search }); }} className="flex gap-2 flex-1 min-w-48">
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Titel, Nummer..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">Suchen</button>
                </form>
                <select value={filters?.status || ''} onChange={e => navigate({ status: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">Alle Status</option>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <select value={filters?.type || ''} onChange={e => navigate({ type: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">Alle Typen</option>
                    {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
            </div>

            {contracts.data.length === 0 ? (
                <EmptyState title="Keine Verträge" description="Noch keine Verträge angelegt."
                    action={<Link href={route('contracts.create')}><Button variant="primary">Vertrag anlegen</Button></Link>} />
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Vertrag</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Typ</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Kunde</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Laufzeit</th>
                                    <th className="text-right px-4 py-3 font-medium text-gray-700">Wert</th>
                                    <th className="text-center px-4 py-3 font-medium text-gray-700">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {contracts.data.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <Link href={route('contracts.show', c.id)} className="font-medium text-gray-900 hover:text-primary-600">{c.title}</Link>
                                            {c.number && <p className="text-xs text-gray-400 font-mono">{c.number}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{TYPE_LABELS[c.type] || c.type || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500">{c.customer?.name || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {c.start_date && new Date(c.start_date).toLocaleDateString('de-DE')}
                                            {c.end_date && <> – {new Date(c.end_date).toLocaleDateString('de-DE')}</>}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                            {c.value ? Number(c.value).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' ' + c.currency : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {STATUS_LABELS[c.status] || c.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={route('contracts.edit', c.id)} className="text-xs text-gray-400 hover:text-primary-600">Bearbeiten</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4"><Pagination links={contracts.links} meta={contracts} /></div>
                </>
            )}
        </DashboardLayout>
    );
}
