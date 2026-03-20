import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';

export default function Show({ item }) {
    const getStockStatus = () => {
        if (item.current_stock <= 0) return 'text-red-600 bg-red-50';
        if (item.min_stock && item.current_stock <= item.min_stock) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    return (
        <DashboardLayout title={item.name}>
            <Head title={item.name} />

            <PageHeader
                title={item.name}
                subtitle={item.sku ? `SKU: ${item.sku}` : 'Inventarartikel'}
                actions={
                    <div className="flex gap-2">
                        <Link href={route('inventory.index')}>
                            <Button variant="secondary">Zurück</Button>
                        </Link>
                        <Link href={route('inventory.edit', item.id)}>
                            <Button>Bearbeiten</Button>
                        </Link>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                    <dl className="space-y-3">
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Name</dt>
                            <dd className="text-sm font-medium text-gray-900">{item.name}</dd>
                        </div>
                        {item.sku && (
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">SKU</dt>
                                <dd className="text-sm font-medium text-gray-900">{item.sku}</dd>
                            </div>
                        )}
                        {item.barcode && (
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Barcode</dt>
                                <dd className="text-sm font-mono text-gray-900">{item.barcode}</dd>
                            </div>
                        )}
                        {item.description && (
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Beschreibung</dt>
                                <dd className="text-sm text-gray-900 text-right max-w-xs">{item.description}</dd>
                            </div>
                        )}
                        {item.location && (
                            <div className="flex justify-between">
                                <dt className="text-sm text-gray-500">Lagerort</dt>
                                <dd className="text-sm font-medium text-gray-900">{item.location}</dd>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Einheit</dt>
                            <dd className="text-sm font-medium text-gray-900">{item.unit || 'Stk'}</dd>
                        </div>
                    </dl>
                </div>

                {/* Stock */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bestand</h3>
                    <div className="space-y-4">
                        <div className={`rounded-lg p-4 ${getStockStatus()}`}>
                            <p className="text-sm font-medium">Aktueller Bestand</p>
                            <p className="text-3xl font-bold">{item.current_stock} {item.unit || 'Stk'}</p>
                        </div>
                        <div className="rounded-lg p-4 bg-gray-50">
                            <p className="text-sm font-medium text-gray-500">Mindestbestand</p>
                            <p className="text-xl font-bold text-gray-900">{item.min_stock || 0} {item.unit || 'Stk'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Movements */}
            {item.movements && item.movements.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">Lagerbewegungen</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Typ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Menge</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notizen</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {item.movements.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                m.type === 'in' ? 'bg-green-100 text-green-800' :
                                                m.type === 'out' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {m.type === 'in' ? 'Eingang' : m.type === 'out' ? 'Ausgang' : 'Korrektur'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{m.quantity}</td>
                                        <td className="px-6 py-4 text-gray-500">{m.notes || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {new Date(m.created_at).toLocaleDateString('de-DE')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
