import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';

export default function InventoryIndex({ items, filters }) {
    const { data, setData, post, processing } = useForm({
        sku: '',
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
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        const url = new URL(route('inventory.index'));
        if (search) url.searchParams.set('search', search);
        window.location.href = url.toString();
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

    const getStockStatus = (item) => {
        if (item.current_stock <= 0) return 'text-red-600';
        if (item.min_stock && item.current_stock <= item.min_stock) return 'text-yellow-600';
        return 'text-green-600';
    };

    return (
        <DashboardLayout title="Inventar">
            <Head title="Inventar" />

            {/* Page Header */}
            <PageHeader
                title="Inventar"
                subtitle="Verwalten Sie Ihre Inventarartikel"
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Neuer Artikel
                    </Button>
                }
            >
                <div className="mt-4">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        onSubmit={handleSearch}
                        placeholder="Inventar suchen..."
                    />
                </div>
            </PageHeader>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {items.data.length === 0 ? (
                    <EmptyState
                        title="Noch keine Inventarartikel vorhanden"
                        description="Fügen Sie Ihren ersten Inventarartikel hinzu."
                        actionLabel="Ersten Artikel anlegen"
                        onAction={() => setShowModal(true)}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lagerbestand</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Minimal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ort</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.sku || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={route('inventory.show', item.id)} className="font-medium text-gray-900 hover:text-primary-600">{item.name}</Link>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap font-medium ${getStockStatus(item)}`}>
                                            {item.current_stock} {item.unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.min_stock || 0} {item.unit}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.location || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button onClick={() => openMovementModal(item)} className="text-primary-600 hover:text-primary-800 text-sm">Bewegung</button>
                                                <Link href={route('inventory.edit', item.id)} className="text-gray-600 hover:text-gray-800 text-sm">Bearbeiten</Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {items.links && items.links.length > 3 && (
                <div className="mt-4 flex justify-center gap-2">
                    {items.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`px-3 py-1 rounded ${link.active ? 'bg-primary-600 text-white' : 'bg-white border'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

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
                                <Button disabled={processing}>Speichern</Button>
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
