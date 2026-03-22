import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';

export default function TimeTrackingIndex({ timeEntries, totalDuration, projects }) {
    const { activeTimer } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const timerRef = useRef(null);

    const { data: timerData, setData: setTimerData, post: postTimer, processing: timerProcessing } = useForm({
        project_id: '',
        description: '',
    });

    // Timer logic
    useEffect(() => {
        if (activeTimer) {
            const startTime = new Date(activeTimer.start_time).getTime();
            const updateTimer = () => {
                const now = Date.now();
                setTimerSeconds(Math.floor((now - startTime) / 1000));
            };
            updateTimer();
            timerRef.current = setInterval(updateTimer, 1000);
            return () => clearInterval(timerRef.current);
        } else {
            setTimerSeconds(0);
        }
    }, [activeTimer]);

    const formatTimer = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleStartTimer = (e) => {
        e.preventDefault();
        postTimer(route('time-tracking.start'));
    };

    const handleStopTimer = () => {
        postTimer(route('time-tracking.stop', activeTimer.id));
    };

    const { data, setData, post, processing, reset } = useForm({
        project_id: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
    });

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('time-tracking.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };

    const filteredEntries = timeEntries.data.filter(entry =>
        entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout title="Zeiterfassung">
            <Head title="Zeiterfassung" />
            <PageHeader
                title="Zeiterfassung"
                subtitle="Erfassen Sie Ihre Arbeitszeit"
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Neue Zeit
                    </Button>
                }
            >
                <div className="mt-4">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Zeiteinträge suchen..."
                    />
                </div>
            </PageHeader>

            {/* Timer Box */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{activeTimer ? 'Timer laeuft' : 'Timer starten'}</p>
                        <p className={`text-4xl font-mono font-bold ${activeTimer ? 'text-red-600' : 'text-gray-300 dark:text-gray-600'}`}>
                            {formatTimer(timerSeconds)}
                        </p>
                        {activeTimer && activeTimer.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activeTimer.description}</p>
                        )}
                    </div>
                    {!activeTimer ? (
                        <form onSubmit={handleStartTimer} className="flex items-center gap-3">
                            <select value={timerData.project_id} onChange={e => setTimerData('project_id', e.target.value)} className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-3 py-2 text-sm">
                                <option value="">Kein Projekt</option>
                                {projects && (Array.isArray(projects) ? projects : projects.data || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input type="text" placeholder="Beschreibung..." value={timerData.description} onChange={e => setTimerData('description', e.target.value)} className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-3 py-2 text-sm w-48" />
                            <Button type="submit" disabled={timerProcessing}>
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Start
                            </Button>
                        </form>
                    ) : (
                        <Button onClick={handleStopTimer} disabled={timerProcessing} className="!bg-red-600 hover:!bg-red-700">
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                            Stop
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gesamtzeit</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{formatDuration(totalDuration || 0)}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                {filteredEntries.length === 0 ? (
                    <EmptyState
                        title="Noch keine Zeiteinträge vorhanden"
                        description="Erfassen Sie Ihre erste Arbeitszeit."
                        onAction={() => setShowModal(true)}
                    />
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredEntries.map((entry) => (
                            <div key={entry.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{entry.description || 'Keine Beschreibung'}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{entry.project?.name || 'Kein Projekt'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatDuration(entry.duration || 0)}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{entry.start_time ? new Date(entry.start_time).toLocaleDateString('de-DE') : '-'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h2 className="text-xl font-semibold dark:text-gray-100">Neue Zeit erfassen</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Datum *</label>
                                <input type="date" value={data.date} onChange={e => setData('date', e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Projekt</label>
                                <select value={data.project_id} onChange={e => setData('project_id', e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                    <option value="">Kein Projekt</option>
                                    {projects?.data?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startzeit</label>
                                    <input type="time" value={data.start_time} onChange={e => setData('start_time', e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endzeit</label>
                                    <input type="time" value={data.end_time} onChange={e => setData('end_time', e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2} className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setShowModal(false)}>Abbrechen</Button>
                                <Button type="submit" disabled={processing}>Speichern</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
