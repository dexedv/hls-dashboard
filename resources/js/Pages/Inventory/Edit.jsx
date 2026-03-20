import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';

export default function Edit({ item }) {
    const { data, setData, put, processing, errors } = useForm({
        sku: item.sku || '',
        name: item.name || '',
        description: item.description || '',
        category_id: item.category_id || '',
        unit: item.unit || '',
        min_stock: item.min_stock ?? 0,
        current_stock: item.current_stock ?? 0,
        location: item.location || '',
        barcode: item.barcode || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('inventory.update', item.id));
    };

    const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all';

    return (
        <DashboardLayout title="Artikel bearbeiten">
            <Head title={`${item.name} bearbeiten`} />

            <PageHeader
                title="Artikel bearbeiten"
                subtitle={item.name}
                actions={
                    <Link href={route('inventory.index')}>
                        <Button variant="secondary">Zurück</Button>
                    </Link>
                }
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                            <input type="text" value={data.sku} onChange={e => setData('sku', e.target.value)} className={inputClass} />
                            {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Einheit</label>
                            <input type="text" value={data.unit} onChange={e => setData('unit', e.target.value)} placeholder="Stk, kg, L..." className={inputClass} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputClass} required />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                        <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={3} className={inputClass} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lagerbestand</label>
                            <input type="number" value={data.current_stock} onChange={e => setData('current_stock', e.target.value)} min="0" className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mindestbestand</label>
                            <input type="number" value={data.min_stock} onChange={e => setData('min_stock', e.target.value)} min="0" className={inputClass} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lagerort</label>
                        <input type="text" value={data.location} onChange={e => setData('location', e.target.value)} className={inputClass} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                        <input type="text" value={data.barcode} onChange={e => setData('barcode', e.target.value)} className={inputClass} placeholder="Wird automatisch generiert wenn leer" />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                        <Link href={route('inventory.index')}>
                            <Button variant="secondary" type="button">Abbrechen</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Speichern...' : 'Speichern'}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
