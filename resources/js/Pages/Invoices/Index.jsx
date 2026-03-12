import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function InvoicesIndex({ invoices, filters }) {
    const { data, setData, post, processing } = useForm({
        number: '',
        customer_id: '',
        project_id: '',
        status: 'draft',
        issue_date: '',
        due_date: '',
        notes: '',
    });

    const [showModal, setShowModal] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('invoices.store'), {
            onSuccess: () => {
                setShowModal(false);
                setData({ number: '', customer_id: '', project_id: '', status: 'draft', issue_date: '', due_date: '', notes: '' });
            }
        });
    };

    const statusColors = {
        draft: 'bg-gray-100 text-gray-800',
        sent: 'bg-blue-100 text-blue-800',
        paid: 'bg-green-100 text-green-800',
        overdue: 'bg-red-100 text-red-800',
        cancelled: 'bg-gray-100 text-gray-500',
    };

    const statusLabels = {
        draft: 'Entwurf',
        sent: 'Gesendet',
        paid: 'Bezahlt',
        overdue: 'Überfällig',
        cancelled: 'Storniert',
    };

    return (
        <DashboardLayout title="Rechnungen">
            <Head title="Rechnungen" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rechnungen</h1>
                    <p className="text-sm text-gray-500 mt-1">Verwalten Sie Ihre Rechnungen</p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Neue Rechnung
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                {invoices.data.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p>Noch keine Rechnungen vorhanden</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nummer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kunde</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Betrag</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fällig</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {invoices.data.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={route('invoices.show', invoice.id)} className="font-medium text-gray-900 hover:text-primary-600">{invoice.number}</Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{invoice.customer?.name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{invoice.total ? parseFloat(invoice.total).toLocaleString('de-DE') + ' €' : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${statusColors[invoice.status]}`}>{statusLabels[invoice.status] || invoice.status}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('de-DE') : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">Neue Rechnung</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Rechnungsnummer *</label>
                                    <input type="text" value={data.number} onChange={e => setData('number', e.target.value)} className="w-full border rounded-lg px-4 py-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Status</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full border rounded-lg px-4 py-2">
                                        <option value="draft">Entwurf</option>
                                        <option value="sent">Gesendet</option>
                                        <option value="paid">Bezahlt</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Kunde</label>
                                <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)} className="w-full border rounded-lg px-4 py-2">
                                    <option value="">Kunde wählen</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Projekt</label>
                                <select value={data.project_id} onChange={e => setData('project_id', e.target.value)} className="w-full border rounded-lg px-4 py-2">
                                    <option value="">Kein Projekt</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Rechnungsdatum</label>
                                    <input type="date" value={data.issue_date} onChange={e => setData('issue_date', e.target.value)} className="w-full border rounded-lg px-4 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Fälligkeitsdatum</label>
                                    <input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} className="w-full border rounded-lg px-4 py-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Notizen</label>
                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2} className="w-full border rounded-lg px-4 py-2" />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Abbrechen</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Speichern</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
