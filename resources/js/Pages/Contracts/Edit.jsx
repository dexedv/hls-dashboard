import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';

export default function ContractEdit({ contract, customers, projects }) {
    const { data, setData, put, processing, errors } = useForm({
        title: contract.title || '',
        number: contract.number || '',
        description: contract.description || '',
        status: contract.status || 'draft',
        type: contract.type || '',
        start_date: contract.start_date || '',
        end_date: contract.end_date || '',
        value: contract.value || '',
        currency: contract.currency || 'EUR',
        notes: contract.notes || '',
        customer_id: contract.customer_id || '',
        project_id: contract.project_id || '',
    });

    return (
        <DashboardLayout title="Vertrag bearbeiten">
            <Head title="Vertrag bearbeiten" />
            <PageHeader title="Vertrag bearbeiten" subtitle={contract.title} />

            <div className="max-w-2xl">
                <form onSubmit={e => { e.preventDefault(); put(route('contracts.update', contract.id)); }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                        <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vertragsnr.</label>
                            <input type="text" value={data.number} onChange={e => setData('number', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                            <select value={data.type} onChange={e => setData('type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                                <option value="">Kein Typ</option>
                                {[['service','Dienstleistung'],['nda','NDA'],['purchase','Kauf'],['rental','Miete'],['other','Sonstiges']].map(([v,l]) => (
                                    <option key={v} value={v}>{l}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                                {[['draft','Entwurf'],['active','Aktiv'],['expired','Abgelaufen'],['terminated','Gekündigt']].map(([v,l]) => (
                                    <option key={v} value={v}>{l}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Wert</label>
                            <div className="flex gap-2">
                                <input type="number" step="0.01" min="0" value={data.value} onChange={e => setData('value', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                <select value={data.currency} onChange={e => setData('currency', e.target.value)}
                                    className="px-2 py-2 border border-gray-200 rounded-lg text-sm">
                                    {['EUR', 'USD', 'GBP', 'CHF'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
                            <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enddatum</label>
                            <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
                            <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                                <option value="">Kein Kunde</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                            <select value={data.project_id} onChange={e => setData('project_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                                <option value="">Kein Projekt</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                        <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                            rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)}
                            rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                            {processing ? 'Wird gespeichert...' : 'Speichern'}
                        </button>
                        <Link href={route('contracts.show', contract.id)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                            Abbrechen
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
