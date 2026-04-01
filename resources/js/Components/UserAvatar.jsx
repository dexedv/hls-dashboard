/**
 * UserAvatar – shows a user's profile picture or their initials as fallback.
 *
 * Props:
 *   user      – object with { name, avatar }
 *   size      – 'xs' | 'sm' | 'md' | 'lg' | 'xl'  (default 'md')
 *   className – extra classes appended to the wrapper
 */
const SIZES = {
    xs: 'h-5 w-5 text-xs',
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
    xl: 'h-16 w-16 text-xl',
};

export default function UserAvatar({ user, size = 'md', className = '' }) {
    const sizeClass = SIZES[size] ?? SIZES.md;
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';
    const avatarUrl = user?.avatar ? `/storage/${user.avatar}` : null;

    return (
        <div className={`${sizeClass} rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-primary-100 ${className}`}>
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={user?.name ?? ''}
                    className="h-full w-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
            ) : null}
            <span
                className={`font-semibold text-primary-600 ${avatarUrl ? 'hidden' : 'flex'} items-center justify-center h-full w-full`}
                style={avatarUrl ? { display: 'none' } : {}}
            >
                {initials}
            </span>
        </div>
    );
}
