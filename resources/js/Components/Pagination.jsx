import { router } from '@inertiajs/react';

function decodePaginationLabel(label) {
    if (!label) return '';
    return label
        .replace(/&laquo;/g, '\u00AB')
        .replace(/&raquo;/g, '\u00BB')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

export default function Pagination({ links, from, to, total, entityName = 'Eintraege' }) {
    if (!links || links.length <= 3) return null;

    const lastPage = links.length - 2;
    if (lastPage <= 1) return null;

    return (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
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
                                    ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                    : 'bg-gray-50 dark:bg-gray-700 text-gray-300 dark:text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {decodePaginationLabel(link.label)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
