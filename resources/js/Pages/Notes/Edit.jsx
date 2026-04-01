import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import MultiUserSelect from '@/Components/MultiUserSelect';

export default function NoteEdit() {
    const { note, projects, customers, users } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        title: note.title || '',
        content: note.content || '',
        category: note.category || 'general',
        customer_id: note.customer_id || '',
        project_id: note.project_id || '',
        assigned_users: note.assignees?.map(u => u.id) || [],
        pinned: note.pinned || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('notes.update', note.id));
    };

    return (
        <DashboardLayout title={`Notiz bearbeiten: ${note.title}`}>
            <Head title={`Notiz bearbeiten: ${note.title}`} />

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notiz bearbeiten</h1>
                        <p className="text-sm text-gray-500 mt-1">{note.title}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={route('notes.show', note.id)}
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titel <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                required
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                            <select
                                value={data.category}
                                onChange={e => setData('category', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="general">Allgemein</option>
                                <option value="idea">Idee</option>
                                <option value="meeting">Meeting</option>
                                <option value="todo">Aufgabe</option>
                                <option value="important">Wichtig</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
                            <select
                                value={data.customer_id}
                                onChange={e => setData('customer_id', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Kein Kunde</option>
                                {customers?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                            <select
                                value={data.project_id}
                                onChange={e => setData('project_id', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Kein Projekt</option>
                                {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiter</label>
                            <MultiUserSelect
                                users={users || []}
                                selected={data.assigned_users}
                                onChange={val => setData('assigned_users', val)}
                            />
                        </div>

                        <div className="flex items-center mt-6">
                            <input
                                type="checkbox"
                                id="pinned"
                                checked={data.pinned}
                                onChange={e => setData('pinned', e.target.checked)}
                                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                            />
                            <label htmlFor="pinned" className="ml-2 text-sm text-gray-700">Oben anpinnen</label>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Inhalt</label>
                            <textarea
                                value={data.content}
                                onChange={e => setData('content', e.target.value)}
                                rows={8}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
