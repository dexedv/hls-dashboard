import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

const projectStatusColors = {
    active:    'bg-green-100 text-green-700',
    planning:  'bg-blue-100 text-blue-700',
    on_hold:   'bg-yellow-100 text-yellow-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
};
const projectStatusLabels = {
    active: 'Aktiv', planning: 'Planung', on_hold: 'Pausiert', completed: 'Abgeschlossen', cancelled: 'Abgebrochen',
};
const leadStatusColors = {
    new:       'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-purple-100 text-purple-700',
    proposal:  'bg-orange-100 text-orange-700',
    won:       'bg-green-100 text-green-700',
    lost:      'bg-red-100 text-red-700',
};
const leadStatusLabels = {
    new: 'Neu', contacted: 'Kontaktiert', qualified: 'Qualifiziert',
    proposal: 'Angebot', won: 'Gewonnen', lost: 'Verloren',
};

export default function CustomerShow({ customer }) {
    const totalRevenue = customer.invoices
        ?.filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + parseFloat(i.total || 0), 0) ?? null;

    return (
        <DashboardLayout title={customer.name}>
            <Head title={customer.name} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/customers" className="hover:text-primary-600">Kunden</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">{customer.name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-primary-600">
                            {customer.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                        {customer.company && (
                            <p className="text-gray-500 text-sm mt-0.5">{customer.company}</p>
                        )}
                    </div>
                </div>
                <Link href={route('customers.edit', customer.id)}
                    className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Bearbeiten
                </Link>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Kontaktdaten</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">E-Mail</dt>
                                <dd className="text-sm text-gray-900">
                                    {customer.email ? (
                                        <a href={`mailto:${customer.email}`} className="hover:text-primary-600">{customer.email}</a>
                                    ) : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Telefon</dt>
                                <dd className="text-sm text-gray-900">
                                    {customer.phone ? (
                                        <a href={`tel:${customer.phone}`} className="hover:text-primary-600">{customer.phone}</a>
                                    ) : '—'}
                                </dd>
                            </div>
                            {customer.address && (
                                <div className="sm:col-span-2">
                                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Adresse</dt>
                                    <dd className="text-sm text-gray-900 whitespace-pre-wrap">{customer.address}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Notes */}
                    {customer.notes && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-base font-semibold text-gray-900 mb-3">Notizen</h2>
                            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{customer.notes}</p>
                        </div>
                    )}

                    {/* Projects */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">
                                Projekte
                                {customer.projects?.length > 0 && (
                                    <span className="ml-2 text-xs font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                                        {customer.projects.length}
                                    </span>
                                )}
                            </h2>
                            <Link href={`/projects/create?customer_id=${customer.id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                + Neues Projekt
                            </Link>
                        </div>
                        {customer.projects && customer.projects.length > 0 ? (
                            <ul className="divide-y divide-gray-50">
                                {customer.projects.map((project) => (
                                    <li key={project.id}
                                        className={`flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors border-l-4 ${
                                            project.status === 'active'    ? 'border-l-green-500' :
                                            project.status === 'planning'  ? 'border-l-blue-500' :
                                            project.status === 'on_hold'   ? 'border-l-yellow-400' :
                                            project.status === 'completed' ? 'border-l-gray-300' :
                                            'border-l-red-400'
                                        }`}>
                                        <Link href={route('projects.show', project.id)} className="text-sm font-medium text-gray-900 hover:text-primary-600">
                                            {project.name}
                                        </Link>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${projectStatusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {projectStatusLabels[project.status] || project.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="px-6 py-6 text-center text-gray-400 text-sm">Noch keine Projekte vorhanden.</p>
                        )}
                    </div>

                    {/* Leads */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">
                                Leads
                                {customer.leads?.length > 0 && (
                                    <span className="ml-2 text-xs font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                                        {customer.leads.length}
                                    </span>
                                )}
                            </h2>
                            <Link href={`/leads/create?customer_id=${customer.id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                + Neuer Lead
                            </Link>
                        </div>
                        {customer.leads && customer.leads.length > 0 ? (
                            <ul className="divide-y divide-gray-50">
                                {customer.leads.map((lead) => (
                                    <li key={lead.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                                        <div>
                                            <Link href={route('leads.show', lead.id)} className="text-sm font-medium text-gray-900 hover:text-primary-600">
                                                {lead.name}
                                            </Link>
                                            {lead.value && (
                                                <p className="text-xs text-gray-500 mt-0.5">{parseFloat(lead.value).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</p>
                                            )}
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${leadStatusColors[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {leadStatusLabels[lead.status] || lead.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="px-6 py-6 text-center text-gray-400 text-sm">Noch keine Leads vorhanden.</p>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Übersicht</h2>
                        <dl className="space-y-3">
                            {totalRevenue !== null && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                    <dt className="text-sm text-gray-500">Gesamtumsatz</dt>
                                    <dd className="text-sm font-bold text-green-700">
                                        {totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                    </dd>
                                </div>
                            )}
                            {customer.projects?.length > 0 && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                    <dt className="text-sm text-gray-500">Projekte</dt>
                                    <dd className="text-sm font-semibold text-gray-900">{customer.projects.length}</dd>
                                </div>
                            )}
                            {customer.leads?.length > 0 && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                    <dt className="text-sm text-gray-500">Leads</dt>
                                    <dd className="text-sm font-semibold text-gray-900">{customer.leads.length}</dd>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-1">
                                <dt className="text-sm text-gray-500">Kunde seit</dt>
                                <dd className="text-sm text-gray-900">
                                    {new Date(customer.created_at).toLocaleDateString('de-DE')}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <h2 className="text-base font-semibold text-gray-900 mb-3">Schnellaktionen</h2>
                        <div className="space-y-1.5">
                            <Link href={`/invoices/create?customer_id=${customer.id}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors group">
                                <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Rechnung erstellen</span>
                            </Link>
                            <Link href={`/quotes/create?customer_id=${customer.id}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors group">
                                <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200">
                                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">Angebot erstellen</span>
                            </Link>
                            <Link href={`/tickets/create?customer_id=${customer.id}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-rose-50 transition-colors group">
                                <div className="h-7 w-7 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-200">
                                    <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-rose-700">Ticket erstellen</span>
                            </Link>
                            <Link href={`/time-tracking?customer_id=${customer.id}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-teal-50 transition-colors group">
                                <div className="h-7 w-7 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200">
                                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700">Zeit erfassen</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
