import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

export default function StatisticsIndex() {
    const stats = [
        { label: 'Kunden', value: 0, href: '/customers', color: 'text-blue-600' },
        { label: 'Projekte', value: 0, href: '/projects', color: 'text-green-600' },
        { label: 'Aufgaben', value: 0, href: '/tasks', color: 'text-purple-600' },
        { label: 'Leads', value: 0, href: '/leads', color: 'text-orange-600' },
        { label: 'Tickets', value: 0, href: '/tickets', color: 'text-red-600' },
        { label: 'Teammitglieder', value: 0, href: '/team', color: 'text-cyan-600' },
    ];

    return (
        <DashboardLayout title="Statistiken">
            <Head title="Statistiken" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Statistiken</h1>
                <p className="text-sm text-gray-500 mt-1">Berichte und Analysen</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:border-primary-500 hover:shadow-md transition text-center"
                    >
                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    </Link>
                ))}
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12">
                <div className="text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Detaillierte Statistiken</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Detaillierte Berichte und Analysen werden in Kürze verfügbar sein.
                        Nutzen Sie die Navigation, um die verschiedenen Module zu erkunden.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
