import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit() {
    const { invoice, customers, projects } = usePage().props;

    const { data, setData, errors } = useForm({
        number: invoice.number || '',
        customer_id: invoice.customer_id || '',
        project_id: invoice.project_id || '',
        issue_date: invoice.issue_date ? invoice.issue_date.split('T')[0] : '',
        due_date: invoice.due_date ? invoice.due_date.split('T')[0] : '',
        status: invoice.status || 'draft',
        notes: invoice.notes || '',
    });

    const [items, setItems] = useState(
        invoice.items && invoice.items.length > 0
            ? invoice.items.map(i => ({
                description: i.description,
                quantity: parseFloat(i.quantity),
                unit_price: parseFloat(i.unit_price),
            }))
            : [{ description: '', quantity: 1, unit_price: 0 }]
    );
    const [submitting, setSubmitting] = useState(false);

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0), 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.put(route('invoices.update', invoice.id), {
            ...data,
            items,
        }, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <DashboardLayout title="Rechnung bearbeiten">
            <Head title={`Rechnung ${invoice.number} bearbeiten`} />

            <form onSubmit={handleSubmit} className="max-w-6xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Rechnung bearbeiten</h1>
                        <p className="text-sm text-gray-500 mt-1">{invoice.number}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={route('invoices.show', invoice.id)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Abbrechen
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                            {submitting ? 'Speichern...' : 'Speichern'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold mb-4">Positionen</h2>
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 mb-3 items-end">
                                <div className="col-span-6">
                                    <label className="block text-xs text-gray-500 mb-1">Beschreibung</label>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs text-gray-500 mb-1">Menge</label>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs text-gray-500 mb-1">Preis €</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={item.unit_price}
                                        onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="col-span-2 flex items-center gap-2">
                                    <span className="text-sm font-medium">{((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)).toFixed(2)} €</span>
                                    {items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addItem}
                            className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                        >
                            + Position hinzufügen
                        </button>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Gesamtbetrag:</span>
                                <span>{calculateTotal().toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-fit">
                        <h2 className="text-lg font-semibold mb-4">Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rechnungsnummer</label>
                                <input
                                    type="text"
                                    value={data.number}
                                    onChange={(e) => setData('number', e.target.value)}
                                    className={`w-full border ${errors.number ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                    required
                                />
                                {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kunde <span className="text-red-500">*</span></label>
                                <select
                                    value={data.customer_id}
                                    onChange={(e) => setData('customer_id', e.target.value)}
                                    className={`w-full border ${errors.customer_id ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                    required
                                >
                                    <option value="">Kunde wählen</option>
                                    {customers && customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer_id && <p className="text-red-500 text-sm mt-1">{errors.customer_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                                <select
                                    value={data.project_id}
                                    onChange={(e) => setData('project_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Kein Projekt</option>
                                    {projects && projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className={`w-full border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                >
                                    <option value="draft">Entwurf</option>
                                    <option value="sent">Gesendet</option>
                                    <option value="paid">Bezahlt</option>
                                    <option value="overdue">Überfällig</option>
                                    <option value="cancelled">Storniert</option>
                                </select>
                                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rechnungsdatum</label>
                                <input
                                    type="date"
                                    value={data.issue_date}
                                    onChange={(e) => setData('issue_date', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fälligkeitsdatum</label>
                                <input
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e) => setData('due_date', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div>
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
                </div>
            </form>
        </DashboardLayout>
    );
}
