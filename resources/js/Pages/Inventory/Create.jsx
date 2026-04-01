import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';

export default function Create() {
    const { categories, locations, nextSku } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        sku: nextSku || '',
        barcode: '',
        description: '',
        category: '',
        unit: 'pcs',
        min_stock: 0,
        current_stock: 0,
        purchase_price: 0,
        sale_price: 0,
        location_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/inventory');
    };

    return (
        <DashboardLayout title="Neuer Artikel">
            <Head title="Neuer Artikel" />

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Neuer Artikel</h1>
                        <p className="text-sm text-gray-500 mt-1">Erstellen Sie einen neuen Artikel</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/inventory"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Abbrechen
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                            {processing ? 'Speichern...' : 'Speichern'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Artikelname *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                            <input
                                type="text"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                                className={`w-full border ${errors.sku ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            />
                            {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                            <input
                                type="text"
                                value={data.barcode}
                                onChange={(e) => setData('barcode', e.target.value)}
                                className={`w-full border ${errors.barcode ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            />
                            {errors.barcode && <p className="text-red-500 text-sm mt-1">{errors.barcode}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                            <input
                                type="text"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className={`w-full border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                placeholder="z.B. Elektronik, Werkzeug"
                            />
                            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Einheit</label>
                            <select
                                value={data.unit}
                                onChange={(e) => setData('unit', e.target.value)}
                                className={`w-full border ${errors.unit ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            >
                                <option value="pcs">Stück</option>
                                <option value="kg">Kilogramm</option>
                                <option value="m">Meter</option>
                                <option value="l">Liter</option>
                                <option value="box">Karton</option>
                            </select>
                            {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mindestbestand</label>
                            <input
                                type="number"
                                value={data.min_stock}
                                onChange={(e) => setData('min_stock', e.target.value)}
                                className={`w-full border ${errors.min_stock ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            />
                            {errors.min_stock && <p className="text-red-500 text-sm mt-1">{errors.min_stock}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Aktueller Bestand</label>
                            <input
                                type="number"
                                value={data.current_stock}
                                onChange={(e) => setData('current_stock', e.target.value)}
                                className={`w-full border ${errors.current_stock ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            />
                            {errors.current_stock && <p className="text-red-500 text-sm mt-1">{errors.current_stock}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Einkaufspreis (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.purchase_price}
                                onChange={(e) => setData('purchase_price', e.target.value)}
                                className={`w-full border ${errors.purchase_price ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            />
                            {errors.purchase_price && <p className="text-red-500 text-sm mt-1">{errors.purchase_price}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Verkaufspreis (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.sale_price}
                                onChange={(e) => setData('sale_price', e.target.value)}
                                className={`w-full border ${errors.sale_price ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            />
                            {errors.sale_price && <p className="text-red-500 text-sm mt-1">{errors.sale_price}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
