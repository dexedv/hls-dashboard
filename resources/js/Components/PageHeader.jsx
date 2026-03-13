// Page Header Component
export default function PageHeader({
    title,
    subtitle,
    actions,
    children
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex flex-wrap gap-2">
                        {actions}
                    </div>
                )}
            </div>
            {children}
        </div>
    );
}

// Button variants
export function Button({ children, variant = 'primary', className = '', ...props }) {
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    };

    return (
        <button
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function IconButton({ children, className = '', ...props }) {
    return (
        <button
            className={`p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
