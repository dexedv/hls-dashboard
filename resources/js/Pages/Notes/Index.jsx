import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

export default function NotesIndex({ notes, pinned, projects, customers, filters }) {
    const [search, setSearch] = useState(typeof filters?.search === 'string' ? filters.search : '');
    const [sort, setSort] = useState(typeof filters?.sort === 'string' ? filters.sort : 'created_desc');
    const [selectedIds, setSelectedIds] = useState([]);

    const showArchived = filters?.show_archived === '1' || filters?.show_archived === true;

    const navigate = (params) => {
        const url = new URL(route('notes.index'));
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

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    const toggleAll = () => {
        if (selectedIds.length === notes.data.length) setSelectedIds([]);
        else setSelectedIds(notes.data.map(n => n.id));
    };
    const handleBulkArchive = () => {
        if (!selectedIds.length) return;
        router.post(route('notes.bulkArchive'), { ids: selectedIds }, { onSuccess: () => setSelectedIds([]) });
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
                subtitle={showArchived ? 'Archivierte Notizen' : 'Verwalten Sie Ihre Notizen und Wikis'}
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Neue Notiz
                    </Button>
                }
            >
                <div className="mt-4 flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            onSubmit={handleSearch}
                            placeholder="Notizen suchen..."
                        />
                    </div>
                    <select
                        value={sort}
                        onChange={e => handleSort(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="created_desc">Neueste zuerst</option>
                        <option value="created_asc">Älteste zuerst</option>
                        <option value="title">Alphabetisch</option>
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
            {selectedIds.length > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-4 flex items-center justify-between">
                    <span className="text-sm text-primary-800 font-medium">{selectedIds.length} ausgewählt</span>
                    <div className="flex gap-2">
                        {!showArchived && <Button variant="secondary" onClick={handleBulkArchive}>Archivieren</Button>}
                        <Button variant="secondary" onClick={() => setSelectedIds([])}>Aufheben</Button>
                    </div>
                </div>
            )}

            {/* Pinned Notes (only in active view) */}
            {!showArchived && pinned && pinned.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                        Angeheftet
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pinned.map((note) => (
                            <div key={note.id} className="bg-amber-50 border border-amber-200 rounded-xl shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col">
                                <Link href={route('notes.show', note.id)} className="block p-4 flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900 leading-tight">{note.title}</h3>
                                        <svg className="w-4 h-4 text-yellow-500 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">{note.content || 'Keine Inhalte'}</p>
                                </Link>
                                <div className="flex items-center gap-2 px-4 py-2 border-t border-amber-200">
                                    {note.project && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-lg">{note.project.name}</span>}
                                    {note.customer && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg">{note.customer.name}</span>}
                                    {note.created_at && <span className="text-xs text-gray-400">{new Date(note.created_at).toLocaleDateString('de-DE')}</span>}
                                    <button
                                        onClick={() => router.post(route('notes.togglePin', note.id))}
                                        className="ml-auto text-yellow-600 hover:text-yellow-800 transition-colors"
                                        title="Anheftung entfernen"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Notes */}
            <div className={`bg-white rounded-xl shadow-sm border ${showArchived ? 'border-amber-200' : 'border-gray-100'}`}>
                {notes.data.length === 0 ? (
                    <EmptyState
                        title={showArchived ? 'Keine archivierten Notizen' : 'Noch keine Notizen vorhanden'}
                        description={showArchived ? 'Es gibt keine archivierten Notizen.' : 'Erstellen Sie Ihre erste Notiz, um zu beginnen.'}
                        actionLabel="Erste Notiz anlegen"
                        onAction={showArchived ? undefined : () => setShowModal(true)}
                    />
                ) : (
                    <div className="p-4">
                        {/* Select all bar */}
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                            <input type="checkbox" checked={selectedIds.length === notes.data.length && notes.data.length > 0} onChange={toggleAll} className="rounded border-gray-300" />
                            <span className="text-xs text-gray-500">Alle auswählen</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {notes.data.map((note) => {
                                const isSelected = selectedIds.includes(note.id);
                                return (
                                <div key={note.id} className={`relative rounded-xl border flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                                    showArchived
                                        ? 'bg-amber-50/50 border-amber-200'
                                        : isSelected
                                            ? 'border-primary-300 bg-primary-50/30'
                                            : 'bg-white border-gray-100 hover:border-gray-200'
                                }`}>
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSelect(note.id)}
                                        className="absolute top-3 right-3 rounded border-gray-300 z-10"
                                    />
                                    {/* Body */}
                                    <Link href={route('notes.show', note.id)} className="block p-4 pr-8 flex-1">
                                        <div className="flex items-start gap-2 mb-2">
                                            {note.pinned && !showArchived && <svg className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>}
                                            <h3 className="font-semibold text-gray-900 leading-tight">{note.title}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-3">{note.content || 'Keine Inhalte'}</p>
                                    </Link>
                                    {/* Footer */}
                                    <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-2 bg-gray-50/60 rounded-b-xl">
                                        {note.project && <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-lg border border-primary-100">{note.project.name}</span>}
                                        {note.customer && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg">{note.customer.name}</span>}
                                        {showArchived && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg">Archiv</span>}
                                        <span className="text-xs text-gray-400 ml-auto">{new Date(note.created_at).toLocaleDateString('de-DE')}</span>
                                        {showArchived ? (
                                            <button onClick={() => router.post(route('notes.restore', note.id))} className="text-xs text-amber-700 hover:text-amber-900 font-medium">Wiederherstellen</button>
                                        ) : (
                                            <button onClick={() => router.post(route('notes.archive', note.id))} className="text-gray-300 hover:text-gray-500" title="Archivieren">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" /></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <Pagination links={notes.links} from={notes.from} to={notes.to} total={notes.total} entityName="Notizen" />

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
                                <Button type="submit" disabled={processing}>Speichern</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
