import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

export default function KnowledgeBaseIndex({ articles, categories, filters }) {
    const [search, setSearch] = useState(filters?.search || '');

    const navigate = (params) => {
        router.get(route('knowledge-base.index'), { ...filters, ...params }, { preserveScroll: true });
    };

    return (
        <DashboardLayout title="Wissensdatenbank">
            <Head title="Wissensdatenbank" />
            <PageHeader
                title="Wissensdatenbank"
                subtitle={`${articles.total} Artikel`}
                actions={
                    <Link href={route('knowledge-base.create')}>
                        <Button variant="primary">+ Neuer Artikel</Button>
                    </Link>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar: Categories */}
                <div className="space-y-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Kategorien</h3>
                        <button
                            onClick={() => navigate({ category_id: '', search })}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${!filters?.category_id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Alle Artikel
                        </button>
                        {categories.map(c => (
                            <button
                                key={c.id}
                                onClick={() => navigate({ category_id: c.id, search })}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors flex justify-between items-center ${filters?.category_id == c.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <span>{c.name}</span>
                                <span className="text-xs text-gray-400">{c.articles_count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main content */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                        <form onSubmit={e => { e.preventDefault(); navigate({ search }); }} className="flex gap-2">
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Artikel suchen..."
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">Suchen</button>
                        </form>
                    </div>

                    {articles.data.length === 0 ? (
                        <EmptyState title="Keine Artikel gefunden" description="Erstellen Sie den ersten Wissensdatenbank-Artikel."
                            action={<Link href={route('knowledge-base.create')}><Button variant="primary">Artikel erstellen</Button></Link>} />
                    ) : (
                        <>
                            <div className="space-y-3">
                                {articles.data.map(a => (
                                    <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-primary-200 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {a.is_pinned && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">📌 Angepinnt</span>}
                                                    {a.category && <span className="text-xs text-gray-400">{a.category.name}</span>}
                                                </div>
                                                <Link href={route('knowledge-base.show', a.id)} className="text-base font-semibold text-gray-900 hover:text-primary-600">
                                                    {a.title}
                                                </Link>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                    {a.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs text-gray-400">{a.views} Aufrufe</p>
                                                <Link href={route('knowledge-base.edit', a.id)} className="text-xs text-gray-400 hover:text-primary-600 mt-1 block">Bearbeiten</Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4"><Pagination links={articles.links} meta={articles} /></div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
