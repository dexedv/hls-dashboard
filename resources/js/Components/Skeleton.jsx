export function SkeletonBlock({ className = '' }) {
    return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />;
}

export function StatSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                    <SkeletonBlock className="h-3 w-24" />
                    <SkeletonBlock className="h-8 w-20" />
                    <SkeletonBlock className="h-3 w-32" />
                </div>
                <SkeletonBlock className="h-12 w-12 rounded-lg" />
            </div>
        </div>
    );
}

export function CardSkeleton({ lines = 3 }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <SkeletonBlock className="h-5 w-40 mb-4" />
            <div className="space-y-3">
                {Array.from({ length: lines }).map((_, i) => (
                    <SkeletonBlock key={i} className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
                ))}
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <SkeletonBlock key={i} className={`h-4 ${i === 0 ? 'w-32' : 'w-24'} flex-shrink-0`} />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex gap-4 items-center">
                    {Array.from({ length: cols }).map((_, colIdx) => (
                        <SkeletonBlock key={colIdx} className={`h-4 ${colIdx === 0 ? 'w-40' : colIdx === cols - 1 ? 'w-16' : 'w-24'} flex-shrink-0`} />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function FormSkeleton({ fields = 4 }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <SkeletonBlock className="h-6 w-48 mb-6" />
            <div className="space-y-5">
                {Array.from({ length: fields }).map((_, i) => (
                    <div key={i}>
                        <SkeletonBlock className="h-3 w-28 mb-2" />
                        <SkeletonBlock className="h-10 w-full rounded-lg" />
                    </div>
                ))}
                <div className="flex justify-end pt-2">
                    <SkeletonBlock className="h-10 w-32 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <SkeletonBlock className="h-5 w-36 mb-4" />
            <div className="flex items-end gap-2 h-48">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 55].map((h, i) => (
                    <SkeletonBlock key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
                ))}
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
            </div>
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
        </div>
    );
}

export function PageSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header area */}
            <div className="flex items-center justify-between">
                <div>
                    <SkeletonBlock className="h-7 w-48 mb-2" />
                    <SkeletonBlock className="h-4 w-64" />
                </div>
                <SkeletonBlock className="h-10 w-32 rounded-lg" />
            </div>
            {/* Table */}
            <TableSkeleton rows={8} cols={5} />
        </div>
    );
}
