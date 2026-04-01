import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';

export default function KbEdit({ article, categories }) {
    const { data, setData, put, processing, errors } = useForm({
        title: article.title || '',
        content: article.content || '',
        category_id: article.category_id || '',
        status: article.status || 'draft',
        is_pinned: article.is_pinned || false,
    });

    return (
        <DashboardLayout title="Artikel bearbeiten">
            <Head title="Artikel bearbeiten" />
            <PageHeader title="Artikel bearbeiten" subtitle={article.title} />

            <div className="max-w-3xl">
                <form onSubmit={e => { e.preventDefault(); put(route('knowledge-base.update', article.id)); }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                        <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                            <select value={data.category_id} onChange={e => setData('category_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                                <option value="">Keine Kategorie</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                                <option value="draft">Entwurf</option>
                                <option value="published">Veröffentlicht</option>
                            </select>
                        </div>
                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data.is_pinned} onChange={e => setData('is_pinned', e.target.checked)}
                                    className="rounded border-gray-300 text-primary-600" />
                                <span className="text-sm font-medium text-gray-700">📌 Angepinnt</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Inhalt *</label>
                        <textarea value={data.content} onChange={e => setData('content', e.target.value)}
                            rows={16} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 font-mono" required />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                            {processing ? 'Wird gespeichert...' : 'Speichern'}
                        </button>
                        <Link href={route('knowledge-base.show', article.id)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                            Abbrechen
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
