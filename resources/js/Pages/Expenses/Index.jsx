import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    reimbursed: 'bg-blue-100 text-blue-700',
};
const STATUS_LABELS = { pending: 'Ausstehend', approved: 'Genehmigt', rejected: 'Abgelehnt', reimbursed: 'Erstattet' };

export default function ExpensesIndex({ expenses, categories, filters, totalPending, totalApproved }) {
    const [search, setSearch] = useState(filters?.search || '');

    const navigate = (params) => {
        router.get(route('expenses.index'), { ...filters, ...params }, { preserveScroll: true });
    };

    return (
        <DashboardLayout title="Spesen">
            <Head title="Spesen" />
            <PageHeader
                title="Spesen"
                subtitle="Ausgaben und Kostenabrechnungen"
                actions={
                    <Link href={route('expenses.create')}>
                        <Button variant="primary">+ Neue Ausgabe</Button>
                    </Link>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Ausstehend</p>
                    <p className="text-2xl font-bold text-amber-600">{Number(totalPending).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Genehmigt</p>
                    <p className="text-2xl font-bold text-green-600">{Number(totalApproved).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
                <form onSubmit={e => { e.preventDefault(); navigate({ search }); }} className="flex gap-2 flex-1 min-w-48">
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Titel, Kategorie..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">Suchen</button>
                </form>
                <select value={filters?.status || ''} onChange={e => navigate({ status: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">Alle Status</option>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <select value={filters?.category || ''} onChange={e => navigate({ category: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">Alle Kategorien</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {expenses.data.length === 0 ? (
                <EmptyState title="Keine Ausgaben" description="Noch keine Spesen erfasst."
                    action={<Link href={route('expenses.create')}><Button variant="primary">Ausgabe erfassen</Button></Link>} />
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Titel</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Kategorie</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Datum</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Erstellt von</th>
                                    <th className="text-right px-4 py-3 font-medium text-gray-700">Betrag</th>
                                    <th className="text-center px-4 py-3 font-medium text-gray-700">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {expenses.data.map(e => (
                                    <tr key={e.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <Link href={route('expenses.show', e.id)} className="font-medium text-gray-900 hover:text-primary-600">{e.title}</Link>
                                            {e.project && <p className="text-xs text-gray-400">{e.project.name}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{e.category || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500">{e.expense_date ? new Date(e.expense_date).toLocaleDateString('de-DE') : '—'}</td>
                                        <td className="px-4 py-3 text-gray-500">{e.creator?.name || '—'}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                            {Number(e.amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} {e.currency}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[e.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {STATUS_LABELS[e.status] || e.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={route('expenses.edit', e.id)} className="text-xs text-gray-400 hover:text-primary-600">Bearbeiten</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4"><Pagination links={expenses.links} meta={expenses} /></div>
                </>
            )}
        </DashboardLayout>
    );
}
