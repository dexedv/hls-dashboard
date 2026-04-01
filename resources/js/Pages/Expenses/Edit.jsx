import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';

export default function ExpenseEdit({ expense, customers, projects, categories }) {
    const { data, setData, put, processing, errors } = useForm({
        title: expense.title || '',
        description: expense.description || '',
        category: expense.category || '',
        amount: expense.amount || '',
        currency: expense.currency || 'EUR',
        expense_date: expense.expense_date || '',
        status: expense.status || 'pending',
        project_id: expense.project_id || '',
        customer_id: expense.customer_id || '',
    });

    return (
        <DashboardLayout title="Ausgabe bearbeiten">
            <Head title="Ausgabe bearbeiten" />
            <PageHeader title="Ausgabe bearbeiten" subtitle={expense.title} />

            <div className="max-w-2xl">
                <form onSubmit={e => { e.preventDefault(); put(route('expenses.update', expense.id)); }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                        <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Betrag *</label>
                            <div className="flex gap-2">
                                <input type="number" step="0.01" min="0" value={data.amount} onChange={e => setData('amount', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" required />
                                <select value={data.currency} onChange={e => setData('currency', e.target.value)}
                                    className="px-2 py-2 border border-gray-200 rounded-lg text-sm">
                                    {['EUR', 'USD', 'GBP', 'CHF'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                            <input type="date" value={data.expense_date} onChange={e => setData('expense_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                            <input type="text" list="exp-cat2" value={data.category} onChange={e => setData('category', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                            <datalist id="exp-cat2">{categories.map(c => <option key={c} value={c} />)}</datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                                {[['pending','Ausstehend'],['approved','Genehmigt'],['rejected','Abgelehnt'],['reimbursed','Erstattet']].map(([v,l]) => (
                                    <option key={v} value={v}>{l}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                            <select value={data.project_id} onChange={e => setData('project_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                                <option value="">Kein Projekt</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
                            <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                                <option value="">Kein Kunde</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                        <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                            rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                            {processing ? 'Wird gespeichert...' : 'Speichern'}
                        </button>
                        <Link href={route('expenses.show', expense.id)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                            Abbrechen
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
