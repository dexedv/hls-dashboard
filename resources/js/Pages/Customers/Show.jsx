import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

export default function CustomerShow({ customer }) {
    const getStatusColor = (status) => {
        const colors = {
            new: 'bg-blue-100 text-blue-800',
            contacted: 'bg-yellow-100 text-yellow-800',
            qualified: 'bg-purple-100 text-purple-800',
            proposal: 'bg-orange-100 text-orange-800',
            won: 'bg-green-100 text-green-800',
            lost: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <DashboardLayout title={customer.name}>
            <Head title={customer.name} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/customers" className="hover:text-primary-600">Kunden</Link>
                <span>/</span>
                <span className="text-gray-900">{customer.name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-600">
                            {customer.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                        {customer.company && (
                            <p className="text-gray-500">{customer.company}</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={route('customers.edit', customer.id)}
                        className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Bearbeiten
                    </Link>
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
                                <dd className="text-gray-900">{customer.email || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                                <dd className="text-gray-900">{customer.phone || '-'}</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                                <dd className="text-gray-900 whitespace-pre-wrap">{customer.address || '-'}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Notes */}
                    {customer.notes && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notizen</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
                        </div>
                    )}

                    {/* Projects */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Projekte</h2>
                            <Link href={`/projects/create?customer_id=${customer.id}`} className="text-sm text-primary-600 hover:text-primary-700">
                                + Neues Projekt
                            </Link>
                        </div>
                        {customer.projects && customer.projects.length > 0 ? (
                            <ul className="space-y-3">
                                {customer.projects.map((project) => (
                                    <li key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <Link href={route('projects.show', project.id)} className="font-medium text-gray-900 hover:text-primary-600">
                                            {project.name}
                                        </Link>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            project.status === 'active' ? 'bg-green-100 text-green-800' :
                                            project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {project.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">Noch keine Projekte vorhanden.</p>
                        )}
                    </div>

                    {/* Leads */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Leads</h2>
                            <Link href={`/leads/create?customer_id=${customer.id}`} className="text-sm text-primary-600 hover:text-primary-700">
                                + Neuer Lead
                            </Link>
                        </div>
                        {customer.leads && customer.leads.length > 0 ? (
                            <ul className="space-y-3">
                                {customer.leads.map((lead) => (
                                    <li key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <Link href={route('leads.show', lead.id)} className="font-medium text-gray-900 hover:text-primary-600">
                                                {lead.name}
                                            </Link>
                                            <p className="text-sm text-gray-500">{lead.value ? `${parseFloat(lead.value).toLocaleString('de-DE')} €` : '-'}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                                            {lead.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">Noch keine Leads vorhanden.</p>
                        )}
                    </div>
                </div>

                {/* Right Column - Stats */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Übersicht</h2>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Erstellt am</dt>
                                <dd className="text-gray-900">
                                    {new Date(customer.created_at).toLocaleDateString('de-DE', {
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
                                href={`/time-tracking?customer_id=${customer.id}`}
                                className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                            >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Zeit erfassen
                            </Link>
                            <Link
                                href={`/invoices/create?customer_id=${customer.id}`}
                                className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                            >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Rechnung erstellen
                            </Link>
                            <Link
                                href={`/tickets/create?customer_id=${customer.id}`}
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
