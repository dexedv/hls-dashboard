import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    LineChart, Line, PieChart, Pie, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const statusLabels = {
    draft: 'Entwurf',
    sent: 'Gesendet',
    paid: 'Bezahlt',
    overdue: 'Überfällig',
    cancelled: 'Storniert',
};

function ChartCard({ title, children }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            {children}
        </div>
    );
}

export default function FinanceIndex({ stats, recentInvoices, monthlyRevenue, invoicesByStatus, topCustomers }) {
    const invoiceStatusData = Object.entries(invoicesByStatus || {}).map(([key, value]) => ({
        name: statusLabels[key] || key,
        value: value,
    }));

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

            <PageHeader
                title="Finanzen"
                subtitle="Übersicht über Ihre Finanzen"
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <p className="text-sm font-medium text-gray-500">Gesamtumsatz</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {stats?.totalRevenue ? parseFloat(stats.totalRevenue).toLocaleString('de-DE') + ' \u20AC' : '0 \u20AC'}
                    </p>
                </div>
                <Link href="/invoices?status=sent" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-amber-300 transition-all block">
                    <p className="text-sm font-medium text-gray-500">Offene Beträge</p>
                    <p className="text-2xl font-bold text-amber-600 mt-2">
                        {stats?.pendingPayments ? parseFloat(stats.pendingPayments).toLocaleString('de-DE') + ' \u20AC' : '0 \u20AC'}
                    </p>
                    <p className="text-xs text-amber-500 mt-2 font-medium">Gesendete Rechnungen →</p>
                </Link>
                <Link href="/invoices?status=paid" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-green-300 transition-all block">
                    <p className="text-sm font-medium text-gray-500">Bezahlte Rechnungen</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">{stats?.paidInvoices || 0}</p>
                    <p className="text-xs text-green-500 mt-2 font-medium">Bezahlte ansehen →</p>
                </Link>
                <Link href="/invoices?status=draft" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-300 transition-all block">
                    <p className="text-sm font-medium text-gray-500">Offene Rechnungen</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{stats?.openInvoices || 0}</p>
                    <p className="text-xs text-blue-500 mt-2 font-medium">Offene ansehen →</p>
                </Link>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Monthly Revenue */}
                <ChartCard title="Monatliche Umsatzentwicklung">
                    {monthlyRevenue && monthlyRevenue.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value) => [value.toLocaleString('de-DE') + ' \u20AC', 'Umsatz']}
                                />
                                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Umsatz" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">Keine Daten vorhanden</div>
                    )}
                </ChartCard>

                {/* Invoice Status Distribution */}
                <ChartCard title="Rechnungsstatus-Verteilung">
                    {invoiceStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={invoiceStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {invoiceStatusData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">Keine Daten vorhanden</div>
                    )}
                </ChartCard>
            </div>

            {/* Top Customers */}
            {topCustomers && topCustomers.length > 0 && (
                <div className="mb-8">
                    <ChartCard title="Top Kunden nach Umsatz">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topCustomers} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={150} />
                                <Tooltip formatter={(value) => [value.toLocaleString('de-DE') + ' \u20AC', 'Umsatz']} />
                                <Bar dataKey="total" name="Umsatz" radius={[0, 4, 4, 0]}>
                                    {topCustomers.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <Link
                        key={card.title}
                        href={card.href}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-primary-500 hover:shadow-lg transition-all duration-200 flex items-center gap-4"
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
