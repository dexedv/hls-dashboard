import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import SearchInput from '@/Components/SearchInput';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';

export default function LeadsIndex({ leads, filters, statuses = [] }) {
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
        router.visit(url.toString());
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

    // Dynamic status lookup from props
    const getStatusInfo = (statusValue) => {
        const status = statuses.find(s => s.value === statusValue);
        return status ? { color: status.color, label: status.label } : { color: 'bg-gray-100 text-gray-800', label: statusValue };
    };

    return (
        <DashboardLayout title="Leads">
            <Head title="Leads" />

            {/* Page Header */}
            <PageHeader
                title="Leads"
                subtitle="Verwalten Sie Ihre Lead-Pipeline"
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Neuer Lead
                    </Button>
                }
            />

            {/* Pipeline Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].map((status) => {
                    const count = leads.data.filter(l => l.status === status).length;
                    const total = leads.data.filter(l => l.status === status).reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
                    return (
                        <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusInfo(status).color}`}>
                                    {getStatusInfo(status).label}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                            <p className="text-xs text-gray-500">{total.toLocaleString('de-DE')} €</p>
                        </div>
                    );
                })}
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                onSubmit={handleSearch}
                                placeholder="Leads suchen..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Leads Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {leads.data.length === 0 ? (
                    <EmptyState
                        title="Noch keine Leads vorhanden"
                        description="Erstellen Sie Ihren ersten Lead, um Ihre Vertriebspipeline zu starten."
                        actionLabel="Ersten Lead anlegen"
                        onAction={() => setShowModal(true)}
                    />
                ) : (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {leads.data.map((lead) => (
                                <Link
                                    key={lead.id}
                                    href={route('leads.show', lead.id)}
                                    className="border border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200 group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">{lead.name}</h3>
                                            {lead.company && (
                                                <p className="text-sm text-gray-500">{lead.company}</p>
                                            )}
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusInfo(lead.status).color}`}>
                                            {getStatusInfo(lead.status).label}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm mb-3">
                                        {lead.email && (
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="truncate">{lead.email}</span>
                                            </div>
                                        )}
                                        {lead.phone && (
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span>{lead.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm border-t border-gray-50 pt-2">
                                        <span className="text-xs text-gray-400">{lead.source || ''}</span>
                                        <span className="font-semibold text-gray-900">
                                            {lead.value ? parseFloat(lead.value).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '-'}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900">Neuer Lead</h2>
                                <IconButton onClick={() => setShowModal(false)}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </IconButton>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
                                        <input
                                            type="text"
                                            value={data.company}
                                            onChange={(e) => setData('company', e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                            <input
                                                type="text"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Wert (€)</label>
                                            <input
                                                type="number"
                                                value={data.value}
                                                onChange={(e) => setData('value', e.target.value)}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Quelle</label>
                                            <select
                                                value={data.source}
                                                onChange={(e) => setData('source', e.target.value)}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="">Auswählen...</option>
                                                <option value="Website">Website</option>
                                                <option value="Telefon">Telefon</option>
                                                <option value="Messe">Messe</option>
                                                <option value="Empfehlung">Empfehlung</option>
                                                <option value="Social Media">Social Media</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end mt-6">
                                    <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                                        Abbrechen
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Speichern
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
