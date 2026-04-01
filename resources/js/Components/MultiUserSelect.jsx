import { useState, useRef, useEffect } from 'react';

export default function MultiUserSelect({ users = [], selected = [], onChange, error }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggle = (id) => {
        if (selected.includes(id)) {
            onChange(selected.filter(s => s !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    const selectedUsers = users.filter(u => selected.includes(u.id));

    return (
        <div ref={ref} className="relative">
            <div
                onClick={() => setOpen(!open)}
                className={`w-full min-h-[42px] border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 flex flex-wrap gap-1 cursor-pointer bg-white hover:border-gray-400 transition-colors`}
            >
                {selectedUsers.length === 0 ? (
                    <span className="text-gray-400 text-sm self-center">Keine Mitarbeiter ausgewählt</span>
                ) : (
                    selectedUsers.map(u => (
                        <span key={u.id} className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            {u.name}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); toggle(u.id); }}
                                className="text-primary-400 hover:text-primary-700 ml-0.5 leading-none"
                            >
                                ×
                            </button>
                        </span>
                    ))
                )}
                <span className="ml-auto self-center text-gray-400 pl-2">
                    <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </div>

            {open && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                    {users.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-500">Keine Mitarbeiter verfügbar</p>
                    ) : (
                        <ul>
                            {users.map(u => (
                                <li
                                    key={u.id}
                                    onClick={() => toggle(u.id)}
                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer select-none"
                                >
                                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                                        selected.includes(u.id) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {u.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <span className="text-sm text-gray-900 flex-1">{u.name}</span>
                                    {selected.includes(u.id) && (
                                        <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
