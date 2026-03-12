import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function LeadShow({ lead }) {
    const { post, processing } = useForm({});

    const handleConvert = (e) => {
        e.preventDefault();
        if (confirm('Möchten Sie diesen Lead wirklich in einen Kunden umwandeln?')) {
            post(route('leads.convert', lead.id));
        }
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
        <DashboardLayout title={lead.name}>
            <Head title={lead.name} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/leads" className="hover:text-primary-600">Leads</Link>
                <span>/</span>
                <span className="text-gray-900">{lead.name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-600">
                            {lead.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
                            <span className={`px-3 py-1 text-sm rounded-full ${statusColors[lead.status]}`}>
                                {statusLabels[lead.status] || lead.status}
                            </span>
                        </div>
                        {lead.company && (
                            <p className="text-gray-500">{lead.company}</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={route('leads.edit', lead.id)}
                        className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Bearbeiten
                    </Link>
                    {!lead.customer && (
                        <form onSubmit={handleConvert}>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                In Kunde umwandeln
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kontaktdaten</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">E-Mail</dt>
                                <dd className="text-gray-900">{lead.email || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                                <dd className="text-gray-900">{lead.phone || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Quelle</dt>
                                <dd className="text-gray-900">{lead.source || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Wert</dt>
                                <dd className="text-gray-900 font-semibold">
                                    {lead.value ? `${parseFloat(lead.value).toLocaleString('de-DE')} €` : '-'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Customer Info */}
                    {lead.customer && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Verknüpfter Kunde</h2>
                            <Link
                                href={route('customers.show', lead.customer.id)}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                            >
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                    <span className="text-primary-600 font-medium">
                                        {lead.customer.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{lead.customer.name}</p>
                                    <p className="text-sm text-gray-500">{lead.customer.company || 'Keine Firma'}</p>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Right Column - Stats */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Übersicht</h2>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Lead-Wert</dt>
                                <dd className="text-2xl font-bold text-gray-900">
                                    {lead.value ? `${parseFloat(lead.value).toLocaleString('de-DE')} €` : '0 €'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                <dd>
                                    <span className={`px-2 py-1 text-sm rounded-full ${statusColors[lead.status]}`}>
                                        {statusLabels[lead.status] || lead.status}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Erstellt am</dt>
                                <dd className="text-gray-900">
                                    {new Date(lead.created_at).toLocaleDateString('de-DE', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellaktionen</h2>
                        <div className="space-y-2">
                            <Link
                                href={`/quotes/create?lead_id=${lead.id}`}
                                className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                            >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Angebot erstellen
                            </Link>
                            <Link
                                href={`/tickets/create?lead_id=${lead.id}`}
                                className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                            >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                                Ticket erstellen
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
