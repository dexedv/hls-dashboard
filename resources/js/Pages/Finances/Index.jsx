import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

export default function FinanceIndex({ stats }) {
    const cards = [
        {
            title: 'Rechnungen',
            description: 'Verwalten Sie Ihre Rechnungen',
            href: '/invoices',
            icon: (
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            title: 'Angebote',
            description: 'Verwalten Sie Ihre Angebote',
            href: '/quotes',
            icon: (
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
    ];

    return (
        <DashboardLayout title="Finanzen">
            <Head title="Finanzen" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Finanzen</h1>
                <p className="text-sm text-gray-500 mt-1">Übersicht über Ihre Finanzen</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-sm font-medium text-gray-500">Gesamtumsatz</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {stats?.totalRevenue ? parseFloat(stats.totalRevenue).toLocaleString('de-DE') + ' €' : '0 €'}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-sm font-medium text-gray-500">Offene Beträge</p>
                    <p className="text-2xl font-bold text-amber-600 mt-2">
                        {stats?.pendingPayments ? parseFloat(stats.pendingPayments).toLocaleString('de-DE') + ' €' : '0 €'}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-sm font-medium text-gray-500">Bezahlte Rechnungen</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">{stats?.paidInvoices || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-sm font-medium text-gray-500">Offene Rechnungen</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{stats?.openInvoices || 0}</p>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <Link
                        key={card.title}
                        href={card.href}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:border-primary-500 hover:shadow-md transition flex items-center gap-4"
                    >
                        {card.icon}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                            <p className="text-sm text-gray-500">{card.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </DashboardLayout>
    );
}
