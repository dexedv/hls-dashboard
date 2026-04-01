import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';
import MultiUserSelect from '@/Components/MultiUserSelect';

export default function ProjectsIndex({ projects, customers, users = [], filters, statuses = [], priorities = [] }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing } = useForm({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        progress: 0,
        budget: '',
        start_date: '',
        end_date: '',
        customer_id: '',
        assigned_users: [],
    });

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(typeof filters?.search === 'string' ? filters.search : '');
    const [sort, setSort] = useState(typeof filters?.sort === 'string' ? filters.sort : 'end_date');
    const [selectedIds, setSelectedIds] = useState([]);

    const showArchived = filters?.show_archived === '1' || filters?.show_archived === true;

    const navigate = (params) => {
        const url = new URL(route('projects.index'));
        const merged = {
            search: typeof filters?.search === 'string' ? filters.search : '',
            sort: typeof filters?.sort === 'string' ? filters.sort : 'created_desc',
            show_archived: showArchived ? '1' : '',
            ...params,
        };
        Object.entries(merged).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
        router.visit(url.toString(), { preserveScroll: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        navigate({ search });
    };

    const handleSort = (newSort) => {
        setSort(newSort);
        navigate({ sort: newSort, search });
    };

    const toggleArchived = () => {
        navigate({ show_archived: showArchived ? '' : '1', search, sort });
    };

    const handleBulkArchive = () => {
        if (!selectedIds.length) return;
        router.post(route('projects.bulkArchive'), { ids: selectedIds }, {
            onSuccess: () => setSelectedIds([]),
        });
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    const toggleAll = () => {
        if (selectedIds.length === projects.data.length) setSelectedIds([]);
        else setSelectedIds(projects.data.map(p => p.id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('projects.store'), {
            onSuccess: () => {
                setShowModal(false);
                setData({ name: '', description: '', status: 'planning', priority: 'medium', progress: 0, budget: '', start_date: '', end_date: '', customer_id: '', assigned_users: [] });
            }
        });
    };

    // Dynamic status lookup from props
    const getStatusInfo = (statusValue) => {
        const status = statuses.find(s => s.value === statusValue);
        return status ? { color: status.color, label: status.label } : { color: 'bg-gray-100 text-gray-800', label: statusValue };
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
        <DashboardLayout title="Projekte">
            <Head title="Projekte" />

            {/* Page Header */}
            <PageHeader
                title="Projekte"
                subtitle={showArchived ? 'Archivierte Projekte' : 'Verwalten Sie Ihre Projekte'}
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Neues Projekt
                    </Button>
                }
            >
                <div className="mt-4 flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            onSubmit={handleSearch}
                            placeholder="Projekte suchen..."
                        />
                    </div>
                    <select
                        value={sort}
                        onChange={e => handleSort(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="status_progress">Status &amp; Fortschritt</option>
                        <option value="status">Nach Status</option>
                        <option value="priority">Nach Priorität</option>
                        <option value="end_date">Nach Enddatum</option>
                        <option value="created_desc">Neueste zuerst</option>
                        <option value="created_asc">Älteste zuerst</option>
                    </select>
                    <button
                        onClick={toggleArchived}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                            showArchived
                                ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" />
                        </svg>
                        {showArchived ? 'Aktive anzeigen' : 'Archiv'}
                    </button>
                </div>
            </PageHeader>

            {/* Bulk action bar */}
            {selectedIds.length > 0 && !showArchived && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-4 flex items-center justify-between">
                    <span className="text-sm text-primary-800 font-medium">{selectedIds.length} ausgewählt</span>
                    <div className="flex gap-2">
                        <Button onClick={handleBulkArchive} variant="secondary">Archivieren</Button>
                        <Button variant="secondary" onClick={() => setSelectedIds([])}>Aufheben</Button>
                    </div>
                </div>
            )}

            {/* Projects Grid */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden ${showArchived ? 'border-amber-200' : 'border-gray-100 dark:border-gray-700'}`}>
                {projects.data.length === 0 ? (
                    <div className="px-6 py-12">
                        <EmptyState
                            title={showArchived ? 'Keine archivierten Projekte' : 'Noch keine Projekte vorhanden'}
                            description={showArchived ? 'Es gibt keine archivierten Projekte.' : 'Erstellen Sie Ihr erstes Projekt, um zu beginnen.'}
                            actionLabel="Erstes Projekt anlegen"
                            onAction={showArchived ? undefined : () => setShowModal(true)}
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop Grid */}
                        <div className="hidden md:block p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projects.data.map((project) => {
                                    const isAssignedToMe = project.assignees?.some(a => a.id === auth?.user?.id);
                                    const isSelected = selectedIds.includes(project.id);

                                    const statusBorder = {
                                        active: 'border-l-green-500',
                                        planning: 'border-l-blue-500',
                                        on_hold: 'border-l-yellow-500',
                                        completed: 'border-l-gray-400',
                                        cancelled: 'border-l-red-400',
                                    }[project.status] ?? 'border-l-gray-300';

                                    const priorityDot = {
                                        urgent: 'bg-red-500',
                                        high: 'bg-orange-400',
                                        medium: 'bg-yellow-400',
                                        low: 'bg-gray-300',
                                    }[project.priority] ?? 'bg-gray-300';

                                    const progressColor = project.progress >= 100 ? 'bg-green-500' : project.progress >= 60 ? 'bg-primary-500' : project.progress >= 30 ? 'bg-yellow-400' : 'bg-red-400';

                                    return (
                                    <div
                                        key={project.id}
                                        className={`rounded-xl border-l-4 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg relative flex flex-col ${statusBorder} ${
                                            showArchived
                                                ? 'border border-amber-200 bg-amber-50/30'
                                                : isAssignedToMe
                                                    ? 'border border-primary-200 bg-primary-50/40 dark:bg-gray-800'
                                                    : 'border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                                        } ${isSelected ? 'ring-2 ring-primary-400' : ''}`}
                                    >
                                        {/* Card Body */}
                                        <Link href={route('projects.show', project.id)} className="block p-4 flex-1">
                                            {/* Top row: title + status + checkbox */}
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot}`} title={`Priorität: ${project.priority}`} />
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">{project.name}</h3>
                                                    {isAssignedToMe && !showArchived && (
                                                        <span className="text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded font-semibold flex-shrink-0">Ich</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusInfo(project.status).color}`}>
                                                        {getStatusInfo(project.status).label}
                                                    </span>
                                                    {!showArchived && (
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelect(project.id)}
                                                            onClick={e => e.stopPropagation()}
                                                            className="rounded border-gray-300 z-10"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Customer */}
                                            {project.customer && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 truncate">{project.customer.name}</p>
                                            )}

                                            {/* Date */}
                                            {project.end_date && (
                                                <div className="flex items-center gap-1.5 mb-3">
                                                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    <span className="text-xs text-gray-500">{new Date(project.end_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                                    {!showArchived && <DaysBadge date={project.end_date} />}
                                                </div>
                                            )}

                                            {/* Assignee avatars */}
                                            {project.assignees && project.assignees.length > 0 && (
                                                <div className="flex items-center gap-0.5 mb-3">
                                                    {project.assignees.slice(0, 5).map(a => (
                                                        <span key={a.id} title={a.name} className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white dark:border-gray-800 -ml-1 first:ml-0 ${
                                                            a.id === auth?.user?.id ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                                        }`}>
                                                            {a.name?.[0]?.toUpperCase()}
                                                        </span>
                                                    ))}
                                                    {project.assignees.length > 5 && (
                                                        <span className="text-xs text-gray-400 ml-1.5">+{project.assignees.length - 5}</span>
                                                    )}
                                                </div>
                                            )}
                                        </Link>

                                        {/* Footer: progress + budget + archive */}
                                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2.5 bg-gray-50/60 dark:bg-gray-700/40 flex items-center gap-3">
                                            {project.folders_count > 0 && (
                                                <span title={`${project.folders_count} Dokument-Ordner`} className="text-amber-400 flex-shrink-0">
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                                                </span>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{project.progress}%</span>
                                                    {project.budget && (
                                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-0.5">
                                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            {parseFloat(project.budget).toLocaleString('de-DE')} €
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                                    <div className={`h-1.5 rounded-full transition-all ${progressColor}`} style={{ width: `${project.progress}%` }} />
                                                </div>
                                            </div>
                                            {showArchived ? (
                                                <button onClick={() => router.post(route('projects.restore', project.id))} className="text-xs text-amber-700 hover:text-amber-900 font-medium flex-shrink-0">
                                                    Wiederherstellen
                                                </button>
                                            ) : (
                                                <button onClick={() => router.post(route('projects.archive', project.id))} className="text-gray-300 hover:text-gray-500 flex-shrink-0" title="Archivieren">
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
                            {projects.data.map((project) => (
                                <div key={project.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <Link href={route('projects.show', project.id)} className="block">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600">{project.name}</h3>
                                                {project.customer && <p className="text-sm text-gray-500 dark:text-gray-400">{project.customer.name}</p>}
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusInfo(project.status).color}`}>
                                                {getStatusInfo(project.status).label}
                                            </span>
                                        </div>
                                        {project.end_date && (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 mb-1">
                                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {new Date(project.end_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                {!showArchived && <DaysBadge date={project.end_date} />}
                                            </div>
                                        )}
                                        <div className="mt-1 flex items-center justify-between">
                                            <div className="flex items-center gap-2 flex-1">
                                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 max-w-[120px]">
                                                    <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{project.progress}%</span>
                                            </div>
                                            {project.budget && (
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {parseFloat(project.budget).toLocaleString('de-DE')} €
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="mt-2 flex justify-end">
                                        {showArchived ? (
                                            <button onClick={() => router.post(route('projects.restore', project.id))} className="text-xs text-amber-700 hover:text-amber-900 font-medium">Wiederherstellen</button>
                                        ) : (
                                            <button onClick={() => router.post(route('projects.archive', project.id))} className="text-xs text-gray-400 hover:text-gray-600">Archivieren</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                <Pagination links={projects.links} from={projects.from} to={projects.to} total={projects.total} entityName="Projekten" />
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Neues Projekt</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kunde</label>
                                    <select
                                        value={data.customer_id}
                                        onChange={(e) => setData('customer_id', e.target.value)}
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    >
                                        <option value="">Kein Kunde</option>
                                        {customers && customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mitarbeiter</label>
                                    <MultiUserSelect
                                        users={users}
                                        selected={data.assigned_users}
                                        onChange={(val) => setData('assigned_users', val)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        >
                                            <option value="planning">Planung</option>
                                            <option value="active">Aktiv</option>
                                            <option value="on_hold">Pausiert</option>
                                            <option value="completed">Abgeschlossen</option>
                                            <option value="cancelled">Abgebrochen</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priorität</label>
                                        <select
                                            value={data.priority}
                                            onChange={(e) => setData('priority', e.target.value)}
                                            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        >
                                            <option value="low">Niedrig</option>
                                            <option value="medium">Mittel</option>
                                            <option value="high">Hoch</option>
                                            <option value="urgent">Dringend</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget (EUR)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.budget}
                                        onChange={(e) => setData('budget', e.target.value)}
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum</label>
                                        <input
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enddatum</label>
                                        <input
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <Button variant="secondary" onClick={() => setShowModal(false)}>
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
