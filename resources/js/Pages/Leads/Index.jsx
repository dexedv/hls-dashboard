import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function LeadsIndex({ leads, filters }) {
    const { data, setData, post, processing } = useForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        value: '',
        status: 'new',
        source: '',
    });

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        const url = new URL(route('leads.index'));
        if (search) url.searchParams.set('search', search);
        window.location.href = url.toString();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('leads.store'), {
            onSuccess: () => {
                setShowModal(false);
                setData({ name: '', company: '', email: '', phone: '', value: '', status: 'new', source: '' });
            }
        });
    };

    const statusColors = {
        new: 'bg-blue-100 text-blue-800',
        contacted: 'bg-yellow-100 text-yellow-800',
        qualified: 'bg-purple-100 text-purple-800',
        proposal: 'bg-orange-100 text-orange-800',
        won: 'bg-green-100 text-green-800',
        lost: 'bg-red-100 text-red-800',
    };

    const statusLabels = {
        new: 'Neu',
        contacted: 'Kontaktiert',
        qualified: 'Qualifiziert',
        proposal: 'Angebot',
        won: 'Gewonnen',
        lost: 'Verloren',
    };

    return (
        <DashboardLayout title="Leads">
            <Head title="Leads" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                    <p className="text-sm text-gray-500 mt-1">Verwalten Sie Ihre Lead-Pipeline</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Neuer Lead
                </button>
            </div>

            {/* Pipeline Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].map((status) => {
                    const count = leads.data.filter(l => l.status === status).length;
                    const total = leads.data.filter(l => l.status === status).reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
                    return (
                        <div key={status} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status]}`}>
                                    {statusLabels[status]}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                            <p className="text-xs text-gray-500">{total.toLocaleString('de-DE')} €</p>
                        </div>
                    );
                })}
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
                <div className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Leads suchen..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            Suchen
                        </button>
                    </form>
                </div>
            </div>

            {/* Leads Grid */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                {leads.data.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <p>Noch keine Leads vorhanden</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-2 text-primary-600 hover:text-primary-700"
                            >
                                Ersten Lead anlegen
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {leads.data.map((lead) => (
                                <Link
                                    key={lead.id}
                                    href={route('leads.show', lead.id)}
                                    className="border border-gray-100 rounded-lg p-4 hover:shadow-md hover:border-primary-200 transition"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900">{lead.name}</h3>
                                            {lead.company && (
                                                <p className="text-sm text-gray-500">{lead.company}</p>
                                            )}
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[lead.status]}`}>
                                            {statusLabels[lead.status] || lead.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-4 text-sm">
                                        <span className="text-gray-500">{lead.source || '-'}</span>
                                        <span className="font-semibold text-gray-900">
                                            {lead.value ? `${parseFloat(lead.value).toLocaleString('de-DE')} €` : '-'}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {leads.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Zeige {leads.from} - {leads.to} von {leads.total} Leads
                            </div>
                            <div className="flex gap-2">
                                {leads.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && (window.location.href = link.url)}
                                        disabled={!link.url}
                                        className={`px-3 py-1 rounded-lg text-sm ${
                                            link.active
                                                ? 'bg-primary-600 text-white'
                                                : link.url
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Neuer Lead</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
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
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    Abbrechen
                                </button>
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
            )}
        </DashboardLayout>
    );
}
