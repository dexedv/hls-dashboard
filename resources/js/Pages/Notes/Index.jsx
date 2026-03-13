import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';

export default function NotesIndex({ notes, pinned, projects, customers, filters }) {
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        const url = new URL(route('notes.index'));
        if (search) url.searchParams.set('search', search);
        window.location.href = url.toString();
    };

    const { data, setData, post, processing } = useForm({
        title: '',
        content: '',
        project_id: '',
        customer_id: '',
        pinned: false,
    });

    const [showModal, setShowModal] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('notes.store'), {
            onSuccess: () => {
                setShowModal(false);
                setData({ title: '', content: '', project_id: '', customer_id: '', pinned: false });
            }
        });
    };

    return (
        <DashboardLayout title="Notizen">
            <Head title="Notizen" />

            {/* Page Header */}
            <PageHeader
                title="Notizen"
                subtitle="Verwalten Sie Ihre Notizen und Wikis"
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Neue Notiz
                    </Button>
                }
            >
                <div className="mt-4">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        onSubmit={handleSearch}
                        placeholder="Notizen suchen..."
                    />
                </div>
            </PageHeader>

            {/* Pinned Notes */}
            {pinned && pinned.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-medium text-gray-500 mb-3">Angeheftet</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pinned.map((note) => (
                            <Link key={note.id} href={route('notes.show', note.id)} className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-medium text-gray-900">{note.title}</h3>
                                    <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                                </div>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{note.content || 'Keine Inhalte'}</p>
                                {note.project && <p className="text-xs text-primary-600 mt-2">{note.project.name}</p>}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* All Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {notes.data.length === 0 ? (
                    <EmptyState
                        title="Noch keine Notizen vorhanden"
                        description="Erstellen Sie Ihre erste Notiz, um zu beginnen."
                        actionLabel="Erste Notiz anlegen"
                        onAction={() => setShowModal(true)}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {notes.data.map((note) => (
                            <Link key={note.id} href={route('notes.show', note.id)} className="block bg-gray-50 rounded-xl p-4 hover:bg-primary-50/50 hover:shadow-md transition-all duration-200">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-medium text-gray-900">{note.title}</h3>
                                    {note.pinned && <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>}
                                </div>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-3">{note.content || 'Keine Inhalte'}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    {note.project && <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-lg">{note.project.name}</span>}
                                    {note.customer && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">{note.customer.name}</span>}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {notes.links && notes.links.length > 3 && (
                <div className="mt-4 flex justify-center gap-2">
                    {notes.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`px-3 py-1 rounded ${link.active ? 'bg-primary-600 text-white' : 'bg-white border'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-100">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Neue Notiz</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Inhalt</label>
                                <textarea value={data.content} onChange={e => setData('content', e.target.value)} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                                    <select value={data.project_id} onChange={e => setData('project_id', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                        <option value="">Kein Projekt</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
                                    <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                                        <option value="">Kein Kunde</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="pinned" checked={data.pinned} onChange={e => setData('pinned', e.target.checked)} className="rounded border-gray-300" />
                                <label htmlFor="pinned" className="text-sm text-gray-700">Anheften</label>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <Button variant="secondary" onClick={() => setShowModal(false)}>Abbrechen</Button>
                                <Button disabled={processing}>Speichern</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
