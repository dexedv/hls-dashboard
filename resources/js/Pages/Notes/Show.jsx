import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

const categoryLabel = {
    general:   'Allgemein',
    idea:      'Idee',
    meeting:   'Meeting',
    todo:      'Aufgabe',
    important: 'Wichtig',
};

export default function NoteShow() {
    const { note } = usePage().props;

    const handleArchive = () => {
        router.post(route('notes.archive', note.id));
    };

    const handleTogglePin = () => {
        router.post(route('notes.togglePin', note.id));
    };

    const handleDelete = () => {
        if (confirm('Notiz wirklich löschen?')) {
            router.delete(route('notes.destroy', note.id));
        }
    };

    return (
        <DashboardLayout title={note.title}>
            <Head title={note.title} />

            <div className="max-w-3xl">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/notes" className="text-sm text-gray-500 hover:text-gray-700">Notizen</Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-sm text-gray-700 font-medium">{note.title}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {note.pinned && (
                                <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                            )}
                            {note.title}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleTogglePin}
                            title={note.pinned ? 'Anheftung entfernen' : 'Anheften'}
                            className={`p-2 rounded-lg border transition-colors ${note.pinned ? 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100' : 'border-gray-200 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                        </button>
                        <Link
                            href={route('notes.edit', note.id)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Bearbeiten
                        </Link>
                        <button
                            onClick={handleArchive}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Archivieren
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-3 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            Löschen
                        </button>
                    </div>
                </div>

                {/* Meta */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 p-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    {note.category && (
                        <span className="flex items-center gap-1">
                            <span className="font-medium text-gray-500">Kategorie:</span>
                            {categoryLabel[note.category] || note.category}
                        </span>
                    )}
                    {note.project && (
                        <span className="flex items-center gap-1">
                            <span className="font-medium text-gray-500">Projekt:</span>
                            <Link href={route('projects.show', note.project.id)} className="text-primary-600 hover:underline">
                                {note.project.name}
                            </Link>
                        </span>
                    )}
                    {note.customer && (
                        <span className="flex items-center gap-1">
                            <span className="font-medium text-gray-500">Kunde:</span>
                            <Link href={route('customers.show', note.customer.id)} className="text-primary-600 hover:underline">
                                {note.customer.name}
                            </Link>
                        </span>
                    )}
                    {note.creator && (
                        <span className="flex items-center gap-1">
                            <span className="font-medium text-gray-500">Erstellt von:</span>
                            {note.creator.name}
                        </span>
                    )}
                    {note.created_at && (
                        <span className="flex items-center gap-1">
                            <span className="font-medium text-gray-500">Erstellt:</span>
                            {new Date(note.created_at).toLocaleDateString('de-DE')}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    {note.content ? (
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    ) : (
                        <p className="text-gray-400 italic">Kein Inhalt vorhanden.</p>
                    )}
                </div>

                {/* Assignees */}
                {note.assignees && note.assignees.length > 0 && (
                    <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Zugewiesen an</p>
                        <div className="flex flex-wrap gap-2">
                            {note.assignees.map(u => (
                                <span key={u.id} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{u.name}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
