import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    BarChart, Bar, PieChart, Pie, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const statusLabels = {
    // Projects
    planning: 'Planung',
    active: 'Aktiv',
    completed: 'Abgeschlossen',
    on_hold: 'Pausiert',
    cancelled: 'Abgebrochen',
    // Tasks
    todo: 'Offen',
    in_progress: 'In Arbeit',
    review: 'Review',
    done: 'Erledigt',
    // Leads
    new: 'Neu',
    contacted: 'Kontaktiert',
    qualified: 'Qualifiziert',
    proposal: 'Angebot',
    won: 'Gewonnen',
    lost: 'Verloren',
};

function ChartCard({ title, children }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">{title}</div>
            {children}
        </div>
    );
}

function KpiCard({ label, value, href, color, bgColor }) {
    const content = (
        <div className={`${bgColor} rounded-lg p-3 mb-3 inline-block`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-primary-500 hover:shadow-md transition-all duration-200">
                {content}
                <p className="text-sm text-gray-600 font-medium">{label}</p>
            </Link>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {content}
            <p className="text-sm text-gray-600 font-medium">{label}</p>
        </div>
    );
}

function mapToChartData(obj) {
    return Object.entries(obj || {}).map(([key, value]) => ({
        name: statusLabels[key] || key,
        value: value,
    }));
}

export default function StatisticsIndex({ stats, projectsByStatus, tasksByStatus, leadsByStatus, monthlyRevenue, selectedYear, availableYears }) {
    const kpis = [
        { label: 'Kunden', value: stats?.customers || 0, href: '/customers', color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { label: 'Projekte', value: stats?.projects || 0, href: '/projects', color: 'text-green-600', bgColor: 'bg-green-50' },
        { label: 'Aufgaben', value: stats?.tasks || 0, href: '/tasks', color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { label: 'Leads', value: stats?.leads || 0, href: '/leads', color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { label: 'Tickets', value: stats?.tickets || 0, href: '/tickets', color: 'text-red-600', bgColor: 'bg-red-50' },
        { label: 'Umsatz', value: `${((stats?.revenue || 0) / 1000).toFixed(1)}k`, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    ];

    const projectChartData = mapToChartData(projectsByStatus);
    const taskChartData = mapToChartData(tasksByStatus);
    const leadChartData = mapToChartData(leadsByStatus);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number' && entry.value > 100
                                ? entry.value.toLocaleString('de-DE') + ' \u20AC'
                                : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <DashboardLayout title="Statistiken">
            <Head title="Statistiken" />

            <PageHeader
                title="Statistiken"
                subtitle="Berichte und Analysen"
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                {kpis.map((kpi) => (
                    <KpiCard key={kpi.label} {...kpi} />
                ))}
            </div>

            {/* Additional KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Offene Aufgaben</p>
                    <p className="text-2xl font-bold text-amber-600">{stats?.openTasks || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Erledigte Aufgaben</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.completedTasks || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Aktive Projekte</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.activeProjects || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Lead-Konversion</p>
                    <p className="text-2xl font-bold text-purple-600">{stats?.leadConversionRate || 0}%</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Monthly Revenue */}
                <ChartCard title={
                    <div className="flex items-center justify-between">
                        <span>Monatlicher Umsatz</span>
                        <select
                            value={selectedYear}
                            onChange={e => router.get(route('statistics.index'), { year: e.target.value }, { preserveScroll: true })}
                            className="ml-4 border border-gray-200 rounded-lg px-2 py-1 text-sm font-normal focus:ring-2 focus:ring-primary-500"
                        >
                            {(availableYears || [new Date().getFullYear()]).map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                }>
                    {monthlyRevenue && monthlyRevenue.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Umsatz" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">Keine Daten vorhanden</div>
                    )}
                </ChartCard>

                {/* Projects by Status */}
                <ChartCard title="Projekte nach Status">
                    {projectChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={projectChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="value" name="Anzahl" radius={[4, 4, 0, 0]}>
                                    {projectChartData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">Keine Daten vorhanden</div>
                    )}
                </ChartCard>

                {/* Tasks by Status */}
                <ChartCard title="Aufgaben nach Status">
                    {taskChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={taskChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {taskChartData.map((_, index) => (
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

                {/* Leads by Status */}
                <ChartCard title="Leads nach Status">
                    {leadChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={leadChartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                                <Tooltip />
                                <Bar dataKey="value" name="Anzahl" radius={[0, 4, 4, 0]}>
                                    {leadChartData.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">Keine Daten vorhanden</div>
                    )}
                </ChartCard>
            </div>
        </DashboardLayout>
    );
}
