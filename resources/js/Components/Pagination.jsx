import { router } from '@inertiajs/react';

export default function Pagination({ links, from, to, total, entityName = 'Einträge' }) {
    if (!links || links.length <= 3) return null;

    const lastPage = links.length - 2; // Subtract prev/next
    if (lastPage <= 1) return null;

    return (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Zeige {from} - {to} von {total} {entityName}
                </div>
                <div className="flex gap-1">
                    {links.map((link, index) => (
                        <button
                            key={index}
                            onClick={() => link.url && router.visit(link.url)}
                            disabled={!link.url}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                link.active
                                    ? 'bg-primary-600 text-white'
                                    : link.url
                                    ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
