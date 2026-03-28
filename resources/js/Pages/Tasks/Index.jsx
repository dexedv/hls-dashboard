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
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        const url = new URL(route('tasks.index'));
        if (search) url.searchParams.set('search', search);
        router.visit(url.toString());
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

    return (
        <DashboardLayout title="Aufgaben">
            <Head title="Aufgaben" />

            {/* Page Header */}
            <PageHeader
                title="Aufgaben"
                subtitle="Verwalten Sie Ihre Aufgaben"
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Neue Aufgabe
                    </Button>
                }
            >
                <div className="mt-4">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        onSubmit={handleSearch}
                        placeholder="Aufgaben suchen..."
                    />
                </div>
            </PageHeader>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-4 flex items-center justify-between">
                    <span className="text-sm text-primary-800 font-medium">{selectedIds.length} ausgewaehlt</span>
                    <div className="flex gap-2 items-center">
                        <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-sm">
                            <option value="">Status aendern...</option>
                            <option value="todo">Offen</option>
                            <option value="in_progress">In Bearbeitung</option>
                            <option value="review">Review</option>
                            <option value="done">Erledigt</option>
                        </select>
                        {bulkStatus && <Button onClick={handleBulkStatus}>Anwenden</Button>}
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
                            title="Noch keine Aufgaben vorhanden"
                            description="Erstellen Sie Ihre erste Aufgabe, um loszulegen."
                            actionLabel="Erste Aufgabe anlegen"
                            onAction={() => setShowModal(true)}
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop List */}
                        <div className="hidden md:block divide-y divide-gray-100 dark:divide-gray-700">
                            {tasks.data.map((task) => {
                                const isAssignedToMe = task.assignees?.some(a => a.id === auth?.user?.id);
                                return (
                                <div
                                    key={task.id}
                                    className={`flex items-center justify-between p-4 transition-colors duration-150 rounded-xl mx-1 my-1 ${
                                        isAssignedToMe
                                            ? 'bg-primary-50 border border-primary-200 hover:bg-primary-100'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <input type="checkbox" checked={selectedIds.includes(task.id)} onChange={() => toggleSelect(task.id)} className="rounded border-gray-300" onClick={e => e.stopPropagation()} />
                                        <Link href={route('tasks.show', task.id)} className="flex items-center gap-4 flex-1">
                                            <div className={`h-3 w-3 rounded-full ${
                                                task.status === 'done' ? 'bg-green-500' :
                                                task.status === 'in_progress' ? 'bg-blue-500' :
                                                task.status === 'review' ? 'bg-yellow-500' :
                                                'bg-gray-300'
                                            }`}></div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
                                                    {isAssignedToMe && (
                                                        <span className="text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded font-medium">Ich</span>
                                                    )}
                                                </div>
                                                {task.project && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{task.project.name}</p>
                                                )}
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {task.assignees && task.assignees.length > 0 && (
                                            <span className="flex items-center gap-0.5">
                                                {task.assignees.slice(0, 3).map(a => (
                                                    <span key={a.id} title={a.name} className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white -ml-1 first:ml-0 ${
                                                        a.id === auth?.user?.id
                                                            ? 'bg-primary-600 text-white ring-2 ring-primary-400'
                                                            : 'bg-primary-100 text-primary-700'
                                                    }`}>
                                                        {a.name?.[0]?.toUpperCase()}
                                                    </span>
                                                ))}
                                                {task.assignees.length > 3 && (
                                                    <span className="h-6 w-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-semibold border-2 border-white -ml-1">
                                                        +{task.assignees.length - 3}
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                        <span className={`text-xs ${priorityIcons[task.priority]}`}>
                                            {task.priority === 'urgent' && '●●●'}
                                            {task.priority === 'high' && '●●○'}
                                            {task.priority === 'medium' && '●○○'}
                                            {task.priority === 'low' && '○○○'}
                                        </span>
                                        <StatusBadge status={task.status} statuses={statuses} />
                                        {task.due_date && (
                                            <span className="text-sm text-gray-500">
                                                {new Date(task.due_date).toLocaleDateString('de-DE')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                );
                            })}
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
                                        <StatusBadge status={task.status} statuses={statuses} />
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
                                        {task.due_date && (
                                            <span className="text-sm text-gray-500">
                                                {new Date(task.due_date).toLocaleDateString('de-DE')}
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
