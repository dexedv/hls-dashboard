import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import StatusBadge from '@/Components/StatusBadge';
import Pagination from '@/Components/Pagination';
import MultiUserSelect from '@/Components/MultiUserSelect';

export default function TasksIndex({ tasks, filters, projects, users, statuses = [], priorities = [] }) {
    const { auth } = usePage().props;
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    const toggleAll = () => {
        if (selectedIds.length === tasks.data.length) setSelectedIds([]);
        else setSelectedIds(tasks.data.map(t => t.id));
    };
    const handleBulkDelete = () => {
        if (!confirm(`${selectedIds.length} Aufgaben loeschen?`)) return;
        router.post(route('tasks.bulkDelete'), { ids: selectedIds }, { onSuccess: () => setSelectedIds([]) });
    };
    const handleBulkStatus = () => {
        if (!bulkStatus) return;
        router.post(route('tasks.bulkUpdateStatus'), { ids: selectedIds, status: bulkStatus }, { onSuccess: () => { setSelectedIds([]); setBulkStatus(''); } });
    };
    const handleBulkArchive = () => {
        if (!confirm(`${selectedIds.length} Aufgaben archivieren?`)) return;
        router.post(route('tasks.bulkArchive'), { ids: selectedIds }, { onSuccess: () => setSelectedIds([]) });
    };

    const { data, setData, post, processing } = useForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        project_id: '',
        assigned_users: [],
    });

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(typeof filters?.search === 'string' ? filters.search : '');
    const [sort, setSort] = useState(typeof filters?.sort === 'string' ? filters.sort : 'due_date');
    const showArchived = filters?.show_archived === '1' || filters?.show_archived === true;

    const navigate = (params) => {
        const url = new URL(route('tasks.index'));
        const current = {
            search: search || undefined,
            sort: sort !== 'created_desc' ? sort : undefined,
            show_archived: showArchived ? '1' : undefined,
            ...params,
        };
        Object.entries(current).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
        router.visit(url.toString());
    };

    const handleSearch = (e) => {
        e.preventDefault();
        navigate({ search: search || undefined });
    };

    const handleSort = (newSort) => {
        setSort(newSort);
        navigate({ sort: newSort !== 'created_desc' ? newSort : undefined });
    };

    const toggleArchived = () => {
        navigate({ show_archived: showArchived ? undefined : '1', search: undefined });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('tasks.store'), {
            onSuccess: () => {
                setShowModal(false);
                setData({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '', project_id: '', assigned_users: [] });
            }
        });
    };

    const priorityIcons = {
        low: 'text-gray-400',
        medium: 'text-yellow-500',
        high: 'text-orange-500',
        urgent: 'text-red-500',
    };

    const priorityLabels = {
        low: 'Niedrig',
        medium: 'Mittel',
        high: 'Hoch',
        urgent: 'Dringend',
    };

    const DaysBadge = ({ date }) => {
        const today = new Date(); today.setHours(0,0,0,0);
        const due = new Date(date); due.setHours(0,0,0,0);
        const days = Math.round((due - today) / 86400000);
        const label = days < 0 ? `${Math.abs(days)}T überfällig` : days === 0 ? 'Heute' : days === 1 ? 'Morgen' : `${days} Tage`;
        const cls = days < 0 ? 'bg-red-100 text-red-700' : days <= 1 ? 'bg-orange-100 text-orange-700' : days <= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500';
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
    };

    return (
        <DashboardLayout title="Aufgaben">
            <Head title="Aufgaben" />

            {/* Page Header */}
            <PageHeader
                title={showArchived ? 'Archivierte Aufgaben' : 'Aufgaben'}
                subtitle="Verwalten Sie Ihre Aufgaben"
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleArchived}
                            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                                showArchived
                                    ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {showArchived ? '← Aktive Aufgaben' : '📦 Archiv'}
                        </button>
                        {!showArchived && (
                            <Button onClick={() => setShowModal(true)}>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Neue Aufgabe
                            </Button>
                        )}
                    </div>
                }
            >
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            onSubmit={handleSearch}
                            placeholder="Aufgaben suchen..."
                        />
                    </div>
                    <select
                        value={sort}
                        onChange={e => handleSort(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="created_desc">Neueste zuerst</option>
                        <option value="created_asc">Älteste zuerst</option>
                        <option value="status">Nach Status</option>
                        <option value="priority">Nach Priorität</option>
                        <option value="due_date">Fälligkeit</option>
                    </select>
                </div>
            </PageHeader>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-4 flex items-center justify-between">
                    <span className="text-sm text-primary-800 font-medium">{selectedIds.length} ausgewaehlt</span>
                    <div className="flex gap-2 items-center">
                        {!showArchived && (
                            <>
                                <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-sm">
                                    <option value="">Status aendern...</option>
                                    <option value="todo">Offen</option>
                                    <option value="in_progress">In Bearbeitung</option>
                                    <option value="review">Review</option>
                                    <option value="done">Erledigt</option>
                                </select>
                                {bulkStatus && <Button onClick={handleBulkStatus}>Anwenden</Button>}
                                <button onClick={handleBulkArchive} className="px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600">📦 Archivieren</button>
                            </>
                        )}
                        <Button variant="secondary" onClick={() => setSelectedIds([])}>Aufheben</Button>
                        <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">Loeschen</button>
                    </div>
                </div>
            )}

            {/* Tasks List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                {tasks.data.length === 0 ? (
                    <div className="px-6 py-12">
                        <EmptyState
                            title={showArchived ? 'Keine archivierten Aufgaben' : 'Noch keine Aufgaben vorhanden'}
                            description={showArchived ? 'Es befinden sich keine Aufgaben im Archiv.' : 'Erstellen Sie Ihre erste Aufgabe, um loszulegen.'}
                            actionLabel={showArchived ? undefined : 'Erste Aufgabe anlegen'}
                            onAction={showArchived ? undefined : () => setShowModal(true)}
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop List */}
                        <div className="hidden md:block">
                            <div className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700">
                                <input type="checkbox" checked={selectedIds.length === tasks.data.length && tasks.data.length > 0} onChange={toggleAll} className="rounded border-gray-300 mr-4" />
                                <span className="text-xs text-gray-500 font-medium">Alle auswählen</span>
                            </div>
                            <div className="divide-y divide-gray-50 dark:divide-gray-700">
                                {tasks.data.map((task) => {
                                    const isAssignedToMe = task.assignees?.some(a => a.id === auth?.user?.id);
                                    const priorityBorder = { urgent: 'border-l-red-500', high: 'border-l-orange-400', medium: 'border-l-yellow-400', low: 'border-l-gray-300' }[task.priority] ?? 'border-l-gray-200';
                                    const statusDot = { done: 'bg-green-500', in_progress: 'bg-blue-500', review: 'bg-yellow-500', todo: 'bg-gray-300' }[task.status] ?? 'bg-gray-300';
                                    return (
                                    <div key={task.id} className={`flex items-center justify-between px-4 py-3 border-l-4 transition-colors duration-150 ${priorityBorder} ${
                                        showArchived ? 'bg-amber-50/30' : isAssignedToMe ? 'bg-primary-50/40 hover:bg-primary-50' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                    } ${selectedIds.includes(task.id) ? 'bg-primary-50/60' : ''}`}>
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <input type="checkbox" checked={selectedIds.includes(task.id)} onChange={() => toggleSelect(task.id)} className="rounded border-gray-300 flex-shrink-0" onClick={e => e.stopPropagation()} />
                                            <div className={`h-3.5 w-3.5 rounded-full flex-shrink-0 ${statusDot}`} />
                                            <Link href={route('tasks.show', task.id)} className="flex items-center gap-2 min-w-0 flex-1 group">
                                                <span className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 transition-colors">{task.title}</span>
                                                {isAssignedToMe && !showArchived && <span className="text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded font-semibold flex-shrink-0">Ich</span>}
                                                {showArchived && <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-semibold flex-shrink-0">Archiv</span>}
                                            </Link>
                                            {task.project && (
                                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-gray-600 flex-shrink-0">{task.project.name}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                                            {task.assignees && task.assignees.length > 0 && (
                                                <span className="flex items-center">
                                                    {task.assignees.slice(0, 3).map(a => (
                                                        <span key={a.id} title={a.name} className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white -ml-1 first:ml-0 ${a.id === auth?.user?.id ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700'}`}>
                                                            {a.name?.[0]?.toUpperCase()}
                                                        </span>
                                                    ))}
                                                    {task.assignees.length > 3 && <span className="h-6 w-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-semibold border-2 border-white -ml-1">+{task.assignees.length - 3}</span>}
                                                </span>
                                            )}
                                            {task.folders_count > 0 && (
                                                <span title={`${task.folders_count} Dokument-Ordner`} className="text-amber-400 flex-shrink-0">
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                                                </span>
                                            )}
                                            <StatusBadge status={task.status} statuses={statuses} />
                                            {task.due_date && <DaysBadge date={task.due_date} />}
                                            {showArchived ? (
                                                <button onClick={() => router.post(route('tasks.restore', task.id))} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">Wiederherstellen</button>
                                            ) : (
                                                <button onClick={() => router.post(route('tasks.archive', task.id))} className="text-gray-300 hover:text-gray-500 transition-colors" title="Archivieren">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                            {tasks.data.map((task) => (
                                <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <input type="checkbox" checked={selectedIds.includes(task.id)} onChange={() => toggleSelect(task.id)} className="rounded border-gray-300 mt-1" onClick={e => e.stopPropagation()} />
                                            <div>
                                                <Link href={route('tasks.show', task.id)} className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600">
                                                    {task.title}
                                                </Link>
                                                {task.project && <p className="text-sm text-gray-500 dark:text-gray-400">{task.project.name}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={task.status} statuses={statuses} />
                                            {showArchived ? (
                                                <button
                                                    onClick={() => router.post(route('tasks.restore', task.id))}
                                                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                                >
                                                    ↩
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => router.post(route('tasks.archive', task.id))}
                                                    className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
                                                    title="Archivieren"
                                                >
                                                    📦
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2 ml-8 flex items-center gap-3">
                                        <span className={`text-xs ${priorityIcons[task.priority]}`}>
                                            {task.priority === 'urgent' && '●●●'}
                                            {task.priority === 'high' && '●●○'}
                                            {task.priority === 'medium' && '●○○'}
                                            {task.priority === 'low' && '○○○'}
                                        </span>
                                        <span className="text-sm text-gray-500">{priorityLabels[task.priority]}</span>
                                        {task.assignees && task.assignees.length > 0 && (
                                            <span className="flex items-center gap-0.5">
                                                {task.assignees.slice(0, 3).map(a => (
                                                    <span key={a.id} title={a.name} className="h-5 w-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                                                        {a.name?.[0]?.toUpperCase()}
                                                    </span>
                                                ))}
                                                {task.assignees.length > 3 && (
                                                    <span className="text-xs text-gray-500 ml-0.5">+{task.assignees.length - 3}</span>
                                                )}
                                            </span>
                                        )}
                                        {task.due_date && <DaysBadge date={task.due_date} />}
                                        {task.folders_count > 0 && (
                                            <span title={`${task.folders_count} Dokument-Ordner`} className="text-amber-400">
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                <Pagination links={tasks.links} from={tasks.from} to={tasks.to} total={tasks.total} entityName="Aufgaben" />
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Neue Aufgabe</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titel *</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="todo">Offen</option>
                                            <option value="in_progress">In Bearbeitung</option>
                                            <option value="review">Überprüfung</option>
                                            <option value="done">Erledigt</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priorität</label>
                                        <select
                                            value={data.priority}
                                            onChange={(e) => setData('priority', e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="low">Niedrig</option>
                                            <option value="medium">Mittel</option>
                                            <option value="high">Hoch</option>
                                            <option value="urgent">Dringend</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Projekt</label>
                                        <select
                                            value={data.project_id}
                                            onChange={(e) => setData('project_id', e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="">Kein Projekt</option>
                                            {projects && projects.map((project) => (
                                                <option key={project.id} value={project.id}>
                                                    {project.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zugewiesen an</label>
                                        <MultiUserSelect
                                            users={users || []}
                                            selected={data.assigned_users}
                                            onChange={(val) => setData('assigned_users', val)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fälligkeitsdatum</label>
                                        <input
                                            type="date"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
                                    Abbrechen
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Speichern
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
