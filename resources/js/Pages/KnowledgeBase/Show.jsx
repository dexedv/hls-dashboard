import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';

export default function KbShow({ article }) {
    return (
        <DashboardLayout title={article.title}>
            <Head title={article.title} />
            <PageHeader
                title={article.title}
                subtitle={article.category?.name || 'Wissensdatenbank'}
                actions={
                    <div className="flex gap-2">
                        <Link href={route('knowledge-base.edit', article.id)}><Button variant="secondary">Bearbeiten</Button></Link>
                        <Button variant="danger" onClick={() => { if (confirm('Artikel löschen?')) router.delete(route('knowledge-base.destroy', article.id)); }}>Löschen</Button>
                    </div>
                }
            />

            <div className="max-w-3xl">
                {/* Meta */}
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                    {article.is_pinned && <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">📌 Angepinnt</span>}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {article.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                    </span>
                    <span>{article.views} Aufrufe</span>
                    {article.creator && <span>von {article.creator.name}</span>}
                    <span>{article.updated_at ? new Date(article.updated_at).toLocaleDateString('de-DE') : ''}</span>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="prose prose-gray max-w-none text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                        {article.content}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
