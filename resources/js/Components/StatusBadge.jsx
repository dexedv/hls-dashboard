// Status Badge Component
export default function StatusBadge({ status, className = '', statuses = [] }) {
    // Dynamic status lookup from props
    const getStatusStyle = () => {
        if (statuses.length > 0) {
            const statusInfo = statuses.find(s => s.value === status);
            if (statusInfo) {
                return statusInfo.color;
            }
        }
        // Fall back to default styles
        return defaultStyles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // Dynamic label lookup from props
    const getStatusLabel = () => {
        if (statuses.length > 0) {
            const statusInfo = statuses.find(s => s.value === status);
            if (statusInfo) {
                return statusInfo.label;
            }
        }
        // Fall back to default behavior
        return (status || '').replace('_', ' ');
    };

    // Default styles for fallback
    const defaultStyles = {
        // Lead statuses
        new: 'bg-blue-100 text-blue-700 border-blue-200',
        contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        qualified: 'bg-purple-100 text-purple-700 border-purple-200',
        proposal: 'bg-orange-100 text-orange-700 border-orange-200',
        won: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        lost: 'bg-red-100 text-red-700 border-red-200',

        // Task statuses
        todo: 'bg-gray-100 text-gray-700 border-gray-200',
        in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
        review: 'bg-amber-100 text-amber-700 border-amber-200',
        done: 'bg-emerald-100 text-emerald-700 border-emerald-200',

        // Project statuses
        planning: 'bg-gray-100 text-gray-700 border-gray-200',
        active: 'bg-blue-100 text-blue-700 border-blue-200',
        completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        on_hold: 'bg-amber-100 text-amber-700 border-amber-200',
        cancelled: 'bg-red-100 text-red-700 border-red-200',

        // Ticket statuses
        open: 'bg-blue-100 text-blue-700 border-blue-200',
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        closed: 'bg-gray-100 text-gray-700 border-gray-200',

        // Invoice statuses
        draft: 'bg-gray-100 text-gray-700 border-gray-200',
        sent: 'bg-blue-100 text-blue-700 border-blue-200',
        paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        overdue: 'bg-red-100 text-red-700 border-red-200',

        // Quote statuses
        accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        declined: 'bg-red-100 text-red-700 border-red-200',
        expired: 'bg-gray-100 text-gray-700 border-gray-200',

        // Vacation statuses
        approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',

        // Generic
        inactive: 'bg-gray-100 text-gray-700 border-gray-200',
        vip: 'bg-purple-100 text-purple-700 border-purple-200',
        blocked: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle()} ${className}`}>
            {getStatusLabel()}
        </span>
    );
}
