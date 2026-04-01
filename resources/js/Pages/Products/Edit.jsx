import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';

export default function ProductEdit({ product, categories }) {
    const { data, setData, put, processing, errors } = useForm({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price || '',
        cost: product.cost || '',
        unit: product.unit || 'Stück',
        is_active: product.is_active ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('products.update', product.id));
    };

    return (
        <DashboardLayout title="Produkt bearbeiten">
            <Head title="Produkt bearbeiten" />
            <PageHeader title="Produkt bearbeiten" subtitle={product.name} />

            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" required />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                            <input type="text" value={data.sku} onChange={e => setData('sku', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                            {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                            <input type="text" list="cat-list" value={data.category} onChange={e => setData('category', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                            <datalist id="cat-list">{categories.map(c => <option key={c} value={c} />)}</datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preis (€) *</label>
                            <input type="number" step="0.01" min="0" value={data.price} onChange={e => setData('price', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Einkaufspreis (€)</label>
                            <input type="number" step="0.01" min="0" value={data.cost} onChange={e => setData('cost', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Einheit</label>
                            <select value={data.unit} onChange={e => setData('unit', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                                {['Stück', 'kg', 'Liter', 'Stunde', 'Tag', 'Pauschal', 'm', 'm²', 'm³'].map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                                rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div className="col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300 text-primary-600" />
                                <span className="text-sm font-medium text-gray-700">Aktiv</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                            {processing ? 'Wird gespeichert...' : 'Speichern'}
                        </button>
                        <Link href={route('products.show', product.id)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                            Abbrechen
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
