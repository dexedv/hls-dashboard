import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function WarehouseIndex({ stats, inventory }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        item_id: '',
        type: 'in',
        quantity: 1,
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('inventory.movements.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };
    const cards = [
        {
            title: 'Inventar',
            description: 'Verwalten Sie Ihr Inventar',
            href: '/inventory',
            icon: (
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
        },
    ];

    return (
        <DashboardLayout title="Warenwirtschaft">
            <Head title="Warenwirtschaft" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Warenwirtschaft</h1>
                    <p className="text-sm text-gray-500 mt-1">Lagerverwaltung und Bestellungen</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    + Neue Bewegung
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-sm font-medium text-gray-500">Gesamtartikel</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalItems || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-sm font-medium text-gray-500">Niedriger Bestand</p>
                    <p className="text-2xl font-bold text-red-600 mt-2">{stats?.lowStock || 0}</p>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <Link
                        key={card.title}
                        href={card.href}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:border-primary-500 hover:shadow-md transition flex items-center gap-4"
                    >
                        {card.icon}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                            <p className="text-sm text-gray-500">{card.description}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">Neue Bewegung</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Artikel</label>
                                <select value={data.item_id} onChange={e => setData('item_id', e.target.value)} className="w-full border rounded-lg px-4 py-2">
                                    <option value="">Artikel wählen</option>
                                    {inventory?.data?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bewegungstyp</label>
                                <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full border rounded-lg px-4 py-2">
                                    <option value="in">Wareneingang</option>
                                    <option value="out">Warenausgang</option>
                                    <option value="adjustment">Korrektur</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Menge *</label>
                                <input type="number" value={data.quantity} onChange={e => setData('quantity', e.target.value)} className="w-full border rounded-lg px-4 py-2" min="1" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2} className="w-full border rounded-lg px-4 py-2" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Abbrechen</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Speichern</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
