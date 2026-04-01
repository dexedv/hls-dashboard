import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';

export default function Create() {
    const { items, suppliers } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        item_id: '',
        supplier_id: '',
        movement_type: 'in',
        quantity: 1,
        unit_cost: 0,
        project_id: '',
        reference_type: '',
        reference_id: '',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/warehouse');
    };

    return (
        <DashboardLayout title="Neue Lagerbewegung">
            <Head title="Neue Lagerbewegung" />

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Neue Lagerbewegung</h1>
                        <p className="text-sm text-gray-500 mt-1">Buchen Sie Wareneingang oder Warenausgang</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/warehouse"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bewegungstyp *</label>
                            <select
                                value={data.movement_type}
                                onChange={(e) => setData('movement_type', e.target.value)}
                                className={`w-full border ${errors.movement_type ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                required
                            >
                                <option value="in">Wareneingang</option>
                                <option value="out">Warenausgang</option>
                                <option value="adjustment">Bestandsanpassung</option>
                                <option value="transfer">Umlagerung</option>
                            </select>
                            {errors.movement_type && <p className="text-red-500 text-sm mt-1">{errors.movement_type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Artikel *</label>
                            <select
                                value={data.item_id}
                                onChange={(e) => setData('item_id', e.target.value)}
                                className={`w-full border ${errors.item_id ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                required
                            >
                                <option value="">Artikel wählen</option>
                                {items && items.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} ({item.sku})
                                    </option>
                                ))}
                            </select>
                            {errors.item_id && <p className="text-red-500 text-sm mt-1">{errors.item_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Menge *</label>
                            <input
                                type="number"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                                className={`w-full border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                required
                                min="1"
                            />
                            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stückpreis (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.unit_cost}
                                onChange={(e) => setData('unit_cost', parseFloat(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lieferant</label>
                            <select
                                value={data.supplier_id}
                                onChange={(e) => setData('supplier_id', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Kein Lieferant</option>
                                {suppliers && suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Referenztyp</label>
                            <select
                                value={data.reference_type}
                                onChange={(e) => setData('reference_type', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Keine Referenz</option>
                                <option value="purchase_order">Bestellung</option>
                                <option value="project">Projekt</option>
                                <option value="invoice">Rechnung</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
