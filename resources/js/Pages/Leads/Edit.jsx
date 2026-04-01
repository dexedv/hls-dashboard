import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function LeadEdit({ lead, customers }) {
    const { data, setData, put, processing, errors } = useForm({
        name: lead.name || '',
        company: lead.company || '',
        email: lead.email || '',
        phone: lead.phone || '',
        value: lead.value || '',
        status: lead.status || 'new',
        source: lead.source || '',
        customer_id: lead.customer_id || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('leads.update', lead.id));
    };

    return (
        <DashboardLayout title={`${lead.name} bearbeiten`}>
            <Head title={`${lead.name} bearbeiten`} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/leads" className="hover:text-primary-600">Leads</Link>
                <span>/</span>
                <Link href={route('leads.show', lead.id)} className="hover:text-primary-600">{lead.name}</Link>
                <span>/</span>
                <span className="text-gray-900">Bearbeiten</span>
            </nav>

            <div className="max-w-2xl">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
                                <input
                                    type="text"
                                    value={data.company}
                                    onChange={(e) => setData('company', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="new">Neu</option>
                                        <option value="contacted">Kontaktiert</option>
                                        <option value="qualified">Qualifiziert</option>
                                        <option value="proposal">Angebot</option>
                                        <option value="won">Gewonnen</option>
                                        <option value="lost">Verloren</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Wert (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quelle</label>
                                <select
                                    value={data.source}
                                    onChange={(e) => setData('source', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Bitte wählen</option>
                                    <option value="Website">Website</option>
                                    <option value="Empfehlung">Empfehlung</option>
                                    <option value="Cold Call">Cold Call</option>
                                    <option value="Messe">Messe</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="Google">Google</option>
                                    <option value="Sonstiges">Sonstiges</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Verknüpfter Kunde</label>
                                <select
                                    value={data.customer_id}
                                    onChange={(e) => setData('customer_id', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Kein Kunde</option>
                                    {customers && customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name} {customer.company ? `(${customer.company})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end mt-6">
                            <Link
                                href={route('leads.show', lead.id)}
                                className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                Abbrechen
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                            >
                                Speichern
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
