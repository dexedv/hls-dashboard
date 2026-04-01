import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';

function formatDuration(minutes) {
    const mins = Math.abs(Math.round(minutes || 0));
    if (mins === 0) return '0 min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h${m > 0 ? ' ' + m + 'min' : ''}`;
    return `${m} min`;
}

function formatTimer(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// Colour palette for user avatars (cycles through)
const AVATAR_COLORS = [
    'bg-blue-500','bg-emerald-500','bg-violet-500','bg-orange-500',
    'bg-pink-500','bg-teal-500','bg-amber-500','bg-cyan-500',
];

export default function TimeTrackingIndex({ timeEntries, totalDuration, projects, users, userStats, filters }) {
    const { activeTimer, auth } = usePage().props;
    const canEditTime = auth?.permissions?.['time_tracking.edit'];
    const [searchQuery, setSearchQuery]   = useState('');
    const [showModal, setShowModal]       = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const timerRef = useRef(null);

    // ── Timer live clock ──────────────────────────────────────────────────
    const { data: timerData, setData: setTimerData, post: postTimer, processing: timerProcessing } = useForm({
        project_id: '',
        description: '',
    });

    useEffect(() => {
        if (activeTimer) {
            const startTime = new Date(activeTimer.start_time).getTime();
            const tick = () => setTimerSeconds(Math.floor((Date.now() - startTime) / 1000));
            tick();
            timerRef.current = setInterval(tick, 1000);
            return () => clearInterval(timerRef.current);
        } else {
            setTimerSeconds(0);
        }
    }, [activeTimer]);

    const handleStartTimer = (e) => {
        e.preventDefault();
        postTimer(route('time-tracking.start'));
    };

    const handleStopTimer = () => {
        postTimer(route('time-tracking.stop', activeTimer.id));
    };

    // ── Manual entry modal ────────────────────────────────────────────────
    const { data, setData, post, processing, reset } = useForm({
        project_id: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('time-tracking.store'), {
            onSuccess: () => { setShowModal(false); reset(); }
        });
    };

    // ── Group entries by date ────────────────────────────────────────────
    const groupEntriesByDate = (entries) => {
        const groups = {};
        entries.forEach(e => {
            const dateKey = e.start_time
                ? new Date(e.start_time).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
                : 'Kein Datum';
            if (!groups[dateKey]) groups[dateKey] = { label: dateKey, entries: [], totalMinutes: 0 };
            groups[dateKey].entries.push(e);
            groups[dateKey].totalMinutes += (e.duration || 0);
        });
        return Object.values(groups);
    };

    // ── Filter ────────────────────────────────────────────────────────────
    const applyFilter = (key, value) => {
        router.get(route('time-tracking.index'), { ...filters, [key]: value || undefined }, { preserveState: true });
    };

    // ── Table filtering (client-side search) ──────────────────────────────
    const projectsList = Array.isArray(projects) ? projects : projects?.data || [];
    const entriesList  = timeEntries?.data || [];
    const filteredEntries = entriesList.filter(e =>
        e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.project?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout title="Zeiterfassung">
            <Head title="Zeiterfassung" />
            <PageHeader
                title="Zeiterfassung"
                subtitle="Arbeitszeiten aller Mitarbeiter"
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Neue Zeit
                    </Button>
                }
            >
                <div className="mt-4">
                    <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Suchen nach Beschreibung, Projekt, Mitarbeiter..." />
                </div>
            </PageHeader>

            {/* ── Timer Box ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                            {activeTimer ? 'Timer läuft' : 'Timer starten'}
                        </p>
                        <p className={`text-4xl font-mono font-bold tabular-nums ${activeTimer ? 'text-red-600' : 'text-gray-300'}`}>
                            {formatTimer(timerSeconds)}
                        </p>
                        {activeTimer?.description && (
                            <p className="text-sm text-gray-500 mt-0.5">{activeTimer.description}</p>
                        )}
                    </div>
                    {!activeTimer ? (
                        <form onSubmit={handleStartTimer} className="flex items-center gap-2 flex-wrap">
                            <select value={timerData.project_id} onChange={e => setTimerData('project_id', e.target.value)}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                <option value="">Kein Projekt</option>
                                {projectsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input type="text" placeholder="Beschreibung..." value={timerData.description}
                                onChange={e => setTimerData('description', e.target.value)}
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-44" />
                            <Button type="submit" disabled={timerProcessing}>
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Start
                            </Button>
                        </form>
                    ) : (
                        <Button onClick={handleStopTimer} disabled={timerProcessing} className="!bg-red-600 hover:!bg-red-700">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h12v12H6z" />
                            </svg>
                            Stop
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Stats: Total + Per Employee ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                {/* Overall total */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Gesamtzeit</p>
                        <p className="text-2xl font-bold text-gray-900">{formatDuration(totalDuration || 0)}</p>
                    </div>
                </div>

                {/* Per employee */}
                {(userStats || []).map((stat, i) => (
                    <div key={stat.user?.id ?? i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                        <div className={`h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                            {stat.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 truncate">{stat.user?.name || 'Unbekannt'}</p>
                            <p className="text-xl font-bold text-gray-900">{formatDuration(stat.total_minutes)}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-wrap gap-3 mb-4">
                <select value={filters?.project_id || ''} onChange={e => applyFilter('project_id', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500">
                    <option value="">Alle Projekte</option>
                    {projectsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select value={filters?.user_id || ''} onChange={e => applyFilter('user_id', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500">
                    <option value="">Alle Mitarbeiter</option>
                    {(users || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <input type="date" value={filters?.date || ''} onChange={e => applyFilter('date', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500" />
                {(filters?.project_id || filters?.user_id || filters?.date) && (
                    <button onClick={() => router.get(route('time-tracking.index'))}
                        className="text-xs text-gray-500 hover:text-primary-600 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        ✕ Filter zurücksetzen
                    </button>
                )}
            </div>

            {/* ── Entries Table ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredEntries.length === 0 ? (
                    <EmptyState
                        title="Noch keine Zeiteinträge"
                        description="Starte den Timer oder erfasse manuell eine Zeit."
                        onAction={() => setShowModal(true)}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/70">
                                        <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Mitarbeiter</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Beschreibung</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Projekt</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Datum</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Start</th>
                                        <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Ende</th>
                                        <th className="text-right px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Dauer</th>
                                        {canEditTime && <th className="px-5 py-3"></th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupEntriesByDate(filteredEntries).map((group) => (
                                        <>
                                            {/* Day separator row */}
                                            <tr key={`group-${group.label}`} className="bg-gray-50/80 border-y border-gray-100">
                                                <td colSpan={canEditTime ? 8 : 7} className="px-5 py-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{group.label}</span>
                                                        <span className="text-xs font-bold text-gray-700">{formatDuration(group.totalMinutes)}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {group.entries.map((entry, i) => {
                                                const isRunning = !entry.end_time;
                                                const colorIdx  = (users || []).findIndex(u => u.id === entry.user?.id);
                                                const avatarColor = AVATAR_COLORS[(colorIdx >= 0 ? colorIdx : i) % AVATAR_COLORS.length];
                                                return (
                                                    <tr key={entry.id} className={`hover:bg-gray-50 transition-colors border-b border-gray-50 ${isRunning ? 'bg-red-50/40' : ''}`}>
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor}`}>
                                                                    {entry.user?.name?.[0]?.toUpperCase() || '?'}
                                                                </span>
                                                                <span className="font-medium text-gray-800 text-sm">{entry.user?.name || '—'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-gray-700 max-w-[200px] truncate">
                                                            {entry.description || <span className="text-gray-400 italic">Keine Beschreibung</span>}
                                                            {isRunning && <span className="ml-2 text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium animate-pulse">läuft</span>}
                                                        </td>
                                                        <td className="px-5 py-3 text-gray-500">
                                                            {entry.project?.name || <span className="text-gray-300">—</span>}
                                                        </td>
                                                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                                                            {entry.start_time ? new Date(entry.start_time).toLocaleDateString('de-DE') : '—'}
                                                        </td>
                                                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                                                            {entry.start_time ? new Date(entry.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                        </td>
                                                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                                                            {entry.end_time ? new Date(entry.end_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : <span className="text-red-400">läuft</span>}
                                                        </td>
                                                        <td className="px-5 py-3 text-right font-semibold text-gray-800 whitespace-nowrap">
                                                            {isRunning ? <span className="text-red-500">—</span> : formatDuration(entry.duration || 0)}
                                                        </td>
                                                        {canEditTime && (
                                                        <td className="px-5 py-3 text-right">
                                                            <Link href={route('time-tracking.edit', entry.id)}
                                                                className="text-xs text-gray-400 hover:text-primary-600 transition-colors px-2 py-1 rounded hover:bg-gray-100">
                                                                ✏️
                                                            </Link>
                                                        </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {timeEntries?.last_page > 1 && (
                            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                                <span>Seite {timeEntries.current_page} von {timeEntries.last_page} · {timeEntries.total} Einträge</span>
                                <div className="flex gap-2">
                                    {timeEntries.prev_page_url && (
                                        <Link href={timeEntries.prev_page_url} className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">← Zurück</Link>
                                    )}
                                    {timeEntries.next_page_url && (
                                        <Link href={timeEntries.next_page_url} className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Weiter →</Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Manual Entry Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Zeit manuell erfassen</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Datum *</label>
                                <input type="date" value={data.date} onChange={e => setData('date', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                                <select value={data.project_id} onChange={e => setData('project_id', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500">
                                    <option value="">Kein Projekt</option>
                                    {projectsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Startzeit</label>
                                    <input type="time" value={data.start_time} onChange={e => setData('start_time', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Endzeit</label>
                                    <input type="time" value={data.end_time} onChange={e => setData('end_time', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                                    rows={2} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Abbrechen</Button>
                                <Button type="submit" disabled={processing}>Speichern</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
