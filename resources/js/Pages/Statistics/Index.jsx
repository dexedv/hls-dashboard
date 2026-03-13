import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';

export default function StatisticsIndex() {
    const stats = [
        { label: 'Kunden', value: 0, href: '/customers', color: 'text-blue-600', bgColor: 'bg-blue-50', hoverBg: 'hover:bg-blue-100' },
        { label: 'Projekte', value: 0, href: '/projects', color: 'text-green-600', bgColor: 'bg-green-50', hoverBg: 'hover:bg-green-100' },
        { label: 'Aufgaben', value: 0, href: '/tasks', color: 'text-purple-600', bgColor: 'bg-purple-50', hoverBg: 'hover:bg-purple-100' },
        { label: 'Leads', value: 0, href: '/leads', color: 'text-orange-600', bgColor: 'bg-orange-50', hoverBg: 'hover:bg-orange-100' },
        { label: 'Tickets', value: 0, href: '/tickets', color: 'text-red-600', bgColor: 'bg-red-50', hoverBg: 'hover:bg-red-100' },
        { label: 'Teammitglieder', value: 0, href: '/team', color: 'text-cyan-600', bgColor: 'bg-cyan-50', hoverBg: 'hover:bg-cyan-100' },
    ];

    return (
        <DashboardLayout title="Statistiken">
            <Head title="Statistiken" />

            <PageHeader
                title="Statistiken"
                subtitle="Berichte und Analysen"
            />

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-primary-500 hover:shadow-md transition-all duration-200 ${stat.hoverBg}`}
                    >
                        <div className={`${stat.bgColor} rounded-lg p-3 mb-3 inline-block`}>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    </Link>
                ))}
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
                <div className="text-center">
                    <div className="h-20 w-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Detaillierte Statistiken</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Detaillierte Berichte und Analysen werden in Kuerze verfuegbar sein.
                        Nutzen Sie die Navigation, um die verschiedenen Module zu erkunden.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
