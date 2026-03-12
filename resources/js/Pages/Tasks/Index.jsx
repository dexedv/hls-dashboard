import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function TasksIndex({ tasks, filters, projects }) {
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

    const statusColors = {
        todo: 'bg-gray-100 text-gray-800',
        in_progress: 'bg-blue-100 text-blue-800',
        review: 'bg-yellow-100 text-yellow-800',
        done: 'bg-green-100 text-green-800',
    };

    const statusLabels = {
        todo: 'Offen',
        in_progress: 'In Bearbeitung',
        review: 'Überprüfung',
        done: 'Erledigt',
    };

    const priorityColors = {
        low: 'text-gray-500',
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Aufgaben</h1>
                    <p className="text-sm text-gray-500 mt-1">Verwalten Sie Ihre Aufgaben</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Neue Aufgabe
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
                <div className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Aufgaben suchen..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            Suchen
                        </button>
                    </form>
                </div>
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                {tasks.data.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p>Noch keine Aufgaben vorhanden</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-2 text-primary-600 hover:text-primary-700"
                            >
                                Erste Aufgabe anlegen
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {tasks.data.map((task) => (
                            <Link
                                key={task.id}
                                href={route('tasks.show', task.id)}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
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
                                    <span className={`text-xs ${priorityColors[task.priority]}`}>
                                        {task.priority === 'urgent' && '●●●'}
                                        {task.priority === 'high' && '●●○'}
                                        {task.priority === 'medium' && '●○○'}
                                        {task.priority === 'low' && '○○○'}
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[task.status]}`}>
                                        {statusLabels[task.status] || task.status}
                                    </span>
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
                                        className={`px-3 py-1 rounded-lg text-sm ${
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Neue Aufgabe</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="">Nicht zugewiesen</option>
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
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                >
                                    Speichern
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
