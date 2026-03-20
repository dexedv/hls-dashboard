import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import StatusBadge from '@/Components/StatusBadge';

export default function TasksIndex({ tasks, filters, projects, users, statuses = [], priorities = [] }) {
    const { data, setData, post, processing } = useForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        project_id: '',
        assigned_to: '',
    });

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        const url = new URL(route('tasks.index'));
        if (search) url.searchParams.set('search', search);
        window.location.href = url.toString();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('tasks.store'), {
            onSuccess: () => {
                setShowModal(false);
                setData({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '', project_id: '', assigned_to: '' });
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

            {/* Tasks List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                {tasks.data.length === 0 ? (
                    <EmptyState
                        title="Noch keine Aufgaben vorhanden"
                        description="Erstellen Sie Ihre erste Aufgabe, um loszulegen."
                        actionLabel="Erste Aufgabe anlegen"
                        onAction={() => setShowModal(true)}
                    />
                ) : (
                    <div className="divide-y divide-gray-100">
                        {tasks.data.map((task) => (
                            <Link
                                key={task.id}
                                href={route('tasks.show', task.id)}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150 rounded-xl mx-1 my-1"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-3 w-3 rounded-full ${
                                        task.status === 'done' ? 'bg-green-500' :
                                        task.status === 'in_progress' ? 'bg-blue-500' :
                                        task.status === 'review' ? 'bg-yellow-500' :
                                        'bg-gray-300'
                                    }`}></div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                                        {task.project && (
                                            <p className="text-sm text-gray-500">{task.project.name}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
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
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {tasks.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Zeige {tasks.from} - {tasks.to} von {tasks.total} Aufgaben
                            </div>
                            <div className="flex gap-2">
                                {tasks.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && (window.location.href = link.url)}
                                        disabled={!link.url}
                                        className={`px-3 py-1 rounded-xl text-sm transition-colors ${
                                            link.active
                                                ? 'bg-primary-600 text-white'
                                                : link.url
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-100">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Neue Aufgabe</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Zugewiesen an</label>
                                        <select
                                            value={data.assigned_to}
                                            onChange={(e) => setData('assigned_to', e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="">Nicht zugewiesen</option>
                                            {(users || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fälligkeitsdatum</label>
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
