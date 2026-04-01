// Empty State Component
export default function EmptyState({
    icon,
    title,
    description,
    action,
    actionLabel = 'Erstellen',
    onAction
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="h-20 w-20 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                {icon || (
                    <svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">{title || 'Noch nichts vorhanden'}</h3>
            {description && (
                <p className="text-gray-500 mb-4 text-center max-w-sm">{description}</p>
            )}
            {action !== false && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
