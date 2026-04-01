import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6'];

function formatMinutes(mins) {
    if (!mins) return '0 h';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function HoursReportIndex({ entries, byUser, byProject, users, projects, filters, totalMinutes, billableMinutes }) {
    const navigate = (params) => {
        router.get(route('hours-report.index'), { ...filters, ...params }, { preserveScroll: true });
    };

    const userChartData = byUser.map(u => ({
        name: u.user?.name || 'Unbekannt',
        total: Math.round((u.total_minutes || 0) / 60 * 10) / 10,
        billable: Math.round((u.billable_minutes || 0) / 60 * 10) / 10,
    }));

    const projectChartData = byProject.map(p => ({
        name: p.project?.name || 'Kein Projekt',
        hours: Math.round((p.total_minutes || 0) / 60 * 10) / 10,
    }));

    return (
        <DashboardLayout title="Stundenauswertung">
            <Head title="Stundenauswertung" />
            <PageHeader title="Stundenauswertung" subtitle="Mitarbeiter-Stundenkonto" />

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Von</label>
                    <input type="date" value={filters?.from || ''} onChange={e => navigate({ from: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bis</label>
                    <input type="date" value={filters?.to || ''} onChange={e => navigate({ to: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Mitarbeiter</label>
                    <select value={filters?.userId || ''} onChange={e => navigate({ userId: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                        <option value="">Alle Mitarbeiter</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Projekt</label>
                    <select value={filters?.projectId || ''} onChange={e => navigate({ projectId: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                        <option value="">Alle Projekte</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Gesamt</p>
                    <p className="text-2xl font-bold text-blue-600">{formatMinutes(totalMinutes)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Fakturierbar</p>
                    <p className="text-2xl font-bold text-green-600">{formatMinutes(billableMinutes)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Einträge</p>
                    <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-sm text-gray-500">Auslastung</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {totalMinutes > 0 ? Math.round(billableMinutes / totalMinutes * 100) : 0}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* By User chart */}
                {userChartData.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Stunden pro Mitarbeiter</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={userChartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 12 }} unit="h" />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                                <Tooltip formatter={v => `${v}h`} />
                                <Bar dataKey="total" name="Gesamt" radius={[0, 4, 4, 0]}>
                                    {userChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* By Project chart */}
                {projectChartData.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Stunden pro Projekt</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={projectChartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 12 }} unit="h" />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                                <Tooltip formatter={v => `${v}h`} />
                                <Bar dataKey="hours" name="Stunden" radius={[0, 4, 4, 0]}>
                                    {projectChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Details table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900">Zusammenfassung nach Mitarbeiter</h3>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-gray-700">Mitarbeiter</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-700">Einträge</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-700">Gesamt</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-700">Fakturierbar</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-700">Auslastung</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {byUser.map((u, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{u.user?.name || 'Unbekannt'}</td>
                                <td className="px-4 py-3 text-right text-gray-500">{u.entries_count}</td>
                                <td className="px-4 py-3 text-right font-medium">{formatMinutes(u.total_minutes)}</td>
                                <td className="px-4 py-3 text-right text-green-600">{formatMinutes(u.billable_minutes)}</td>
                                <td className="px-4 py-3 text-right">
                                    {u.total_minutes > 0 ? Math.round(u.billable_minutes / u.total_minutes * 100) : 0}%
                                </td>
                            </tr>
                        ))}
                        {byUser.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Keine Zeiteinträge im gewählten Zeitraum</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
