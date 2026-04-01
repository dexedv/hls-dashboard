import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import axios from 'axios';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

export default function InventoryIndex({ items, filters, nextSku }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [importResult, setImportResult] = useState(null);

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    const toggleAll = () => {
        if (selectedIds.length === items.data.length) setSelectedIds([]);
        else setSelectedIds(items.data.map(i => i.id));
    };
    const handleBulkDelete = () => {
        if (!confirm(`${selectedIds.length} Artikel loeschen?`)) return;
        router.post(route('inventory.bulkDelete'), { ids: selectedIds }, { onSuccess: () => setSelectedIds([]) });
    };
    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post(route('import.inventory'), formData);
            setImportResult(res.data);
            router.reload();
        } catch (err) {
            setImportResult({ imported: 0, errors: [err.response?.data?.message || 'Import fehlgeschlagen'] });
        }
        e.target.value = '';
    };

    const { data, setData, post, processing } = useForm({
        sku: nextSku || '',
        name: '',
        description: '',
        category_id: '',
        unit: '',
        min_stock: 0,
        current_stock: 0,
        location: '',
        barcode: '',
    });

    const [showModal, setShowModal] = useState(false);
    const [showMovementModal, setShowMovementModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [search, setSearch] = useState(typeof filters?.search === 'string' ? filters.search : '');
    const [sort, setSort] = useState(typeof filters?.sort === 'string' ? filters.sort : 'low_stock');

    const handleSearch = (e) => {
        e.preventDefault();
        const url = new URL(route('inventory.index'));
        if (search) url.searchParams.set('search', search);
        if (sort !== 'name') url.searchParams.set('sort', sort);
        router.visit(url.toString());
    };

    const handleSort = (newSort) => {
        setSort(newSort);
        const url = new URL(route('inventory.index'));
        if (search) url.searchParams.set('search', search);
        if (newSort !== 'name') url.searchParams.set('sort', newSort);
        router.visit(url.toString());
    };

    const { data: movementData, setData: setMovementData, post: postMovement, processing: movementProcessing } = useForm({
        type: 'in',
        quantity: 1,
        project_id: '',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('inventory.store'), {
            onSuccess: () => {
                setShowModal(false);
                setData({ sku: '', name: '', description: '', category_id: '', unit: '', min_stock: 0, current_stock: 0, location: '', barcode: '' });
            }
        });
    };

    const handleMovementSubmit = (e) => {
        e.preventDefault();
        postMovement(route('inventory.movement', selectedItem.id), {
            onSuccess: () => {
                setShowMovementModal(false);
                setSelectedItem(null);
                setMovementData({ type: 'in', quantity: 1, project_id: '', notes: '' });
            }
        });
    };

    const openMovementModal = (item) => {
        setSelectedItem(item);
        setShowMovementModal(true);
    };

    const getStockBadge = (stock) => {
        if (stock < 10)  return { bg: 'bg-red-100 text-red-700 border border-red-200',    icon: '⚠' };
        if (stock < 50)  return { bg: 'bg-orange-100 text-orange-700 border border-orange-200', icon: null };
        return                  { bg: 'bg-green-100 text-green-700 border border-green-200',  icon: null };
    };

    return (
        <DashboardLayout title="Inventar">
            <Head title="Inventar" />

            {/* Page Header */}
            <PageHeader
                title="Inventar"
                subtitle="Verwalten Sie Ihre Inventarartikel"
                actions={
                    <div className="flex gap-2">
                        <a href={route('export.inventory')} className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Export
                        </a>
                        <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Import
                            <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
                        </label>
                        <Button onClick={() => setShowModal(true)}>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Neuer Artikel
                        </Button>
                    </div>
                }
            >
                <div className="mt-4 flex gap-3 items-center">
                    <div className="flex-1">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            onSubmit={handleSearch}
                            placeholder="Inventar suchen..."
                        />
                    </div>
                    <select
                        value={sort}
                        onChange={e => handleSort(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                        <option value="name">Name (A–Z)</option>
                        <option value="low_stock">⚠ Geringer Bestand zuerst</option>
                        <option value="stock_asc">Bestand ↑</option>
                        <option value="stock_desc">Bestand ↓</option>
                    </select>
                </div>
            </PageHeader>

            {/* Import Result */}
            {importResult && (
                <div className={`rounded-xl p-3 mb-4 ${importResult.errors?.length ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                    <p className="text-sm font-medium">{importResult.imported} Artikel importiert</p>
                    {importResult.errors?.length > 0 && (
                        <ul className="text-xs text-red-600 mt-1">{importResult.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                    )}
                    <button onClick={() => setImportResult(null)} className="text-xs text-gray-500 mt-1 underline">Schliessen</button>
                </div>
            )}

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-4 flex items-center justify-between">
                    <span className="text-sm text-primary-800 font-medium">{selectedIds.length} ausgewaehlt</span>
                    <div className="flex gap-2 items-center">
                        <Button variant="secondary" onClick={() => setSelectedIds([])}>Aufheben</Button>
                        <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">Loeschen</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {items.data.length === 0 ? (
                    <div className="px-6 py-12">
                        <EmptyState
                            title="Noch keine Inventarartikel vorhanden"
                            description="Fügen Sie Ihren ersten Inventarartikel hinzu."
                            actionLabel="Ersten Artikel anlegen"
                            onAction={() => setShowModal(true)}
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">
                                            <input type="checkbox" checked={selectedIds.length === items.data.length && items.data.length > 0} onChange={toggleAll} className="rounded border-gray-300" />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lagerbestand</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Minimal</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {items.data.map((item) => {
                                        const rowTint = item.current_stock < 10 ? 'bg-red-50/40' : item.current_stock < 50 ? 'bg-orange-50/30' : '';
                                        const b = getStockBadge(item.current_stock);
                                        const maxStock = Math.max(item.current_stock, item.min_stock * 3, 10);
                                        const pct = Math.min(100, Math.round((item.current_stock / maxStock) * 100));
                                        const barColor = item.current_stock < 10 ? 'bg-red-400' : item.current_stock < 50 ? 'bg-orange-400' : 'bg-green-500';
                                        return (
                                        <tr key={item.id} className={`transition-colors hover:brightness-95 ${rowTint}`}>
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} className="rounded border-gray-300" />
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-xs font-mono text-gray-400">{item.sku || '-'}</td>
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <Link href={route('inventory.show', item.id)} className="font-semibold text-gray-900 hover:text-primary-600">{item.name}</Link>
                                                {item.location && <p className="text-xs text-gray-400 mt-0.5">{item.location}</p>}
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold ${b.bg}`}>
                                                        {b.icon && <span>{b.icon}</span>}
                                                        {item.current_stock} <span className="font-normal text-xs opacity-70">{item.unit}</span>
                                                    </span>
                                                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-400">{item.min_stock || 0} {item.unit}</td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button onClick={() => openMovementModal(item)} className="text-xs font-medium text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition-colors">Bewegung</button>
                                                    <Link href={route('inventory.edit', item.id)} className="text-gray-400 hover:text-gray-600 transition-colors" title="Bearbeiten">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {items.data.map((item) => (
                                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} className="rounded border-gray-300 mt-1" />
                                            <div>
                                                <Link href={route('inventory.show', item.id)} className="font-medium text-gray-900 hover:text-primary-600">
                                                    {item.name}
                                                </Link>
                                                {item.sku && <p className="text-sm text-gray-500">{item.sku}</p>}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => openMovementModal(item)} className="p-1.5 text-primary-600 hover:text-primary-800 rounded-lg text-xs">Bewegung</button>
                                            <Link href={route('inventory.edit', item.id)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="mt-2 ml-8 flex items-center gap-4">
                                        {(() => { const b = getStockBadge(item.current_stock); return (
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${b.bg}`}>
                                                {b.icon && <span>{b.icon}</span>}
                                                {item.current_stock} {item.unit}
                                            </span>
                                        ); })()}
                                        {item.category && <span className="text-sm text-gray-500">{item.category.name}</span>}
                                        {item.location && <span className="text-sm text-gray-500">{item.location}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                <Pagination links={items.links} from={items.from} to={items.to} total={items.total} entityName="Artikel" />
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-100">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Neuer Inventarartikel</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                    <input type="text" value={data.sku} onChange={e => setData('sku', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Einheit</label>
                                    <input type="text" value={data.unit} onChange={e => setData('unit', e.target.value)} placeholder="Stk, kg, L..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lagerbestand</label>
                                    <input type="number" value={data.current_stock} onChange={e => setData('current_stock', e.target.value)} min="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mindestbestand</label>
                                    <input type="number" value={data.min_stock} onChange={e => setData('min_stock', e.target.value)} min="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lagerort</label>
                                <input type="text" value={data.location} onChange={e => setData('location', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <Button variant="secondary" onClick={() => setShowModal(false)}>Abbrechen</Button>
                                <Button type="submit" disabled={processing}>Speichern</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Movement Modal */}
            {showMovementModal && selectedItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Lagerbewegung: {selectedItem.name}</h2>
                            <IconButton onClick={() => setShowMovementModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleMovementSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                <select value={movementData.type} onChange={e => setMovementData('type', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                    <option value="in">Wareneingang</option>
                                    <option value="out">Warenausgang</option>
                                    <option value="adjustment">Korrektur</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Menge *</label>
                                <input type="number" value={movementData.quantity} onChange={e => setMovementData('quantity', e.target.value)} min="1" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                                <textarea value={movementData.notes} onChange={e => setMovementData('notes', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <Button variant="secondary" onClick={() => setShowMovementModal(false)}>Abbrechen</Button>
                                <Button disabled={movementProcessing}>Erfassen</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
