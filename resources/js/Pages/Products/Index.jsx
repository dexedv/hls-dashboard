import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

export default function ProductsIndex({ products, categories, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [syncing, setSyncing] = useState(false);

    const handleSyncInventory = () => {
        if (!confirm('Alle Inventarartikel ohne passendes Produkt in den Katalog importieren?')) return;
        setSyncing(true);
        router.post(route('products.syncInventory'), {}, { onFinish: () => setSyncing(false) });
    };

    const navigate = (params) => {
        router.get(route('products.index'), { ...filters, ...params }, { preserveScroll: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        navigate({ search });
    };

    return (
        <DashboardLayout title="Produktkatalog">
            <Head title="Produktkatalog" />
            <PageHeader
                title="Produktkatalog"
                subtitle={`${products.total} Produkte`}
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={handleSyncInventory}
                            disabled={syncing}
                            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            {syncing ? 'Importiere...' : 'Aus Inventar importieren'}
                        </button>
                        <Link href={route('products.create')}>
                            <Button variant="primary">+ Neues Produkt</Button>
                        </Link>
                    </div>
                }
            />

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Name, SKU, Kategorie..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Suchen</button>
                </form>
                <select
                    value={filters?.category || ''}
                    onChange={e => navigate({ category: e.target.value, search })}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                    <option value="">Alle Kategorien</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {products.data.length === 0 ? (
                <EmptyState
                    title="Keine Produkte"
                    description="Erstellen Sie Ihren ersten Artikel im Produktkatalog."
                    action={<Link href={route('products.create')}><Button variant="primary">Produkt erstellen</Button></Link>}
                />
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">SKU</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Kategorie</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-700">Einheit</th>
                                    <th className="text-right px-4 py-3 font-medium text-gray-700">Preis</th>
                                    <th className="text-center px-4 py-3 font-medium text-gray-700">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.data.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <Link href={route('products.show', p.id)} className="font-medium text-gray-900 hover:text-primary-600">{p.name}</Link>
                                            {p.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.description}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500">{p.category || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500">{p.unit}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                            {Number(p.price).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {p.is_active ? 'Aktiv' : 'Inaktiv'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={route('products.edit', p.id)} className="text-xs text-gray-400 hover:text-primary-600 mr-3">Bearbeiten</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4">
                        <Pagination links={products.links} meta={products} />
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}
