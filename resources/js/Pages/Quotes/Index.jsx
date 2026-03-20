import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';

export default function QuotesIndex({ quotes, customers, statuses = [] }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Dynamic status lookup from props
    const getStatusInfo = (statusValue) => {
        const status = statuses.find(s => s.value === statusValue);
        return status ? { color: status.color, label: status.label } : { color: 'bg-gray-100 text-gray-800', label: statusValue };
    };

    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        number: '',
        customer_id: '',
        valid_until: '',
        status: 'draft',
        notes: '',
        items: [{ description: '', quantity: 1, unit_price: 0 }],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('quotes.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
                setData('items', [{ description: '', quantity: 1, unit_price: 0 }]);
            }
        });
    };

    const addItem = () => {
        setData('items', [...data.items, { description: '', quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const filteredQuotes = quotes.data.filter(quote =>
        quote.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout title="Angebote">
            <Head title="Angebote" />
            <PageHeader
                title="Angebote"
                subtitle="Verwalten Sie Ihre Angebote"
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Neues Angebot
                    </Button>
                }
            >
                <div className="mt-4">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Angebote suchen..."
                    />
                </div>
            </PageHeader>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {filteredQuotes.length === 0 ? (
                    <EmptyState
                        title="Noch keine Angebote vorhanden"
                        description="Erstellen Sie Ihr erstes Angebot, um zu beginnen."
                        onAction={() => setShowModal(true)}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nummer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kunde</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Betrag</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredQuotes.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{quote.number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{quote.customer?.name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{quote.total ? parseFloat(quote.total).toLocaleString('de-DE') + ' €' : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${getStatusInfo(quote.status).color}`}>{getStatusInfo(quote.status).label}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">Neues Angebot</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Angebotsnummer *</label>
                                    <input type="text" value={data.number} onChange={e => setData('number', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
                                    <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                        <option value="">Kunde wählen</option>
                                        {(customers || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gültig bis</label>
                                    <input type="date" value={data.valid_until} onChange={e => setData('valid_until', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                        <option value="draft">Entwurf</option>
                                        <option value="sent">Gesendet</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Positionen</label>
                                    <button type="button" onClick={addItem} className="text-sm text-primary-600 hover:text-primary-700 transition-colors">+ Position hinzufügen</button>
                                </div>
                                {data.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                                        <div className="col-span-6">
                                            <input type="text" placeholder="Beschreibung" value={item.description} onChange={e => setData('items', data.items.map((it, i) => i === index ? { ...it, description: e.target.value } : it))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" placeholder="Menge" value={item.quantity} onChange={e => setData('items', data.items.map((it, i) => i === index ? { ...it, quantity: parseFloat(e.target.value) } : it))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" step="0.01" placeholder="Preis €" value={item.unit_price} onChange={e => setData('items', data.items.map((it, i) => i === index ? { ...it, unit_price: parseFloat(e.target.value) } : it))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            <span className="text-sm font-medium">{(item.quantity * item.unit_price).toFixed(2)} €</span>
                                            {data.items.length > 1 && <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 transition-colors">✕</button>}
                                        </div>
                                    </div>
                                ))}
                                <div className="text-right font-semibold mt-2">Gesamt: {calculateTotal().toFixed(2)} €</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setShowModal(false)}>Abbrechen</Button>
                                <Button type="submit" disabled={processing}>Speichern</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
