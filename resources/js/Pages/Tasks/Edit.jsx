import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import MultiUserSelect from '@/Components/MultiUserSelect';

export default function TaskEdit() {
    const { task, projects, users } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        project_id: task.project_id || '',
        assigned_users: task.assignees?.map(a => a.id) || [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('tasks.update', task.id));
    };

    return (
        <DashboardLayout title="Aufgabe bearbeiten">
            <Head title={`Aufgabe bearbeiten: ${task.title}`} />

            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/tasks" className="hover:text-primary-600">Aufgaben</Link>
                <span>/</span>
                <Link href={route('tasks.show', task.id)} className="hover:text-primary-600">{task.title}</Link>
                <span>/</span>
                <span className="text-gray-900">Bearbeiten</span>
            </nav>

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Aufgabe bearbeiten</h1>
                        <p className="text-sm text-gray-500 mt-1">{task.title}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={route('tasks.show', task.id)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Abbrechen
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                            {processing ? 'Speichern...' : 'Speichern'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titel <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                required
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className={`w-full border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            >
                                <option value="todo">Offen</option>
                                <option value="in_progress">In Bearbeitung</option>
                                <option value="review">Überprüfung</option>
                                <option value="done">Erledigt</option>
                            </select>
                            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
                            <select
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                className={`w-full border ${errors.priority ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            >
                                <option value="low">Niedrig</option>
                                <option value="medium">Mittel</option>
                                <option value="high">Hoch</option>
                                <option value="urgent">Dringend</option>
                            </select>
                            {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiter (Zugewiesen an)</label>
                            <MultiUserSelect
                                users={users || []}
                                selected={data.assigned_users}
                                onChange={(val) => setData('assigned_users', val)}
                                error={errors.assigned_users}
                            />
                            {errors.assigned_users && <p className="text-red-500 text-sm mt-1">{errors.assigned_users}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                            <select
                                value={data.project_id}
                                onChange={(e) => setData('project_id', e.target.value)}
                                className={`w-full border ${errors.project_id ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            >
                                <option value="">Kein Projekt</option>
                                {(projects || []).map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {errors.project_id && <p className="text-red-500 text-sm mt-1">{errors.project_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fälligkeitsdatum</label>
                            <input
                                type="date"
                                value={data.due_date}
                                onChange={(e) => setData('due_date', e.target.value)}
                                className={`w-full border ${errors.due_date ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            />
                            {errors.due_date && <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
