import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import MultiUserSelect from '@/Components/MultiUserSelect';

const PRESET_TAGS = ['Außendienst', 'Innendienst', 'Meeting', 'Reise', 'Schulung', 'Dringend', 'Kundentermin'];

const EVENT_TYPE_COLORS = {
    meeting:  'bg-blue-100 text-blue-800 border-blue-200',
    deadline: 'bg-red-100 text-red-800 border-red-200',
    call:     'bg-green-100 text-green-800 border-green-200',
    delivery: 'bg-orange-100 text-orange-800 border-orange-200',
    pickup:   'bg-purple-100 text-purple-800 border-purple-200',
    reminder: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    other:    'bg-gray-100 text-gray-800 border-gray-200',
};
const EVENT_TYPE_LABELS = {
    meeting: 'Meeting', deadline: 'Deadline', call: 'Anruf',
    delivery: 'Lieferung', pickup: 'Abholung', reminder: 'Erinnerung', other: 'Sonstiges',
};

// ─── Event Tooltip ────────────────────────────────────────────────────────────
function EventTooltip({ event, pos, currentUserId, onClose }) {
    if (!event) return null;
    const start = new Date(event.start);
    const end   = event.end ? new Date(event.end) : null;
    const isAssignedToMe = event.assignees?.some(a => a.id === currentUserId);

    // Flip left if near right edge
    const leftPos = pos.x + 280 > window.innerWidth ? pos.x - 280 : pos.x;

    return (
        <div
            style={{ position: 'fixed', left: Math.max(8, leftPos), top: pos.y + 6, zIndex: 9999 }}
            className="bg-white rounded-xl shadow-2xl border border-gray-200 w-72 text-sm"
            onMouseEnter={() => {}} onMouseLeave={onClose}
        >
            {/* Header */}
            <div className={`px-4 py-3 rounded-t-xl border-b ${isAssignedToMe ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="font-semibold text-gray-900 leading-snug">{event.title}</p>
                        {isAssignedToMe && (
                            <span className="inline-block mt-1 text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded font-medium">Ich bin eingeladen</span>
                        )}
                    </div>
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${EVENT_TYPE_COLORS[event.event_type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {EVENT_TYPE_LABELS[event.event_type] || event.event_type || 'Termin'}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="px-4 py-3 space-y-2">
                {/* Zeit */}
                <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs">
                        {event.all_day ? 'Ganztägig' : start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        {end && !event.all_day && ` – ${end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                </div>

                {/* Projekt */}
                {event.project?.name && (
                    <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="text-xs truncate">{event.project.name}</span>
                    </div>
                )}

                {/* Kunde */}
                {event.customer?.name && (
                    <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9" />
                        </svg>
                        <span className="text-xs truncate">{event.customer.name}</span>
                    </div>
                )}

                {/* Mitarbeiter */}
                {event.assignees && event.assignees.length > 0 && (
                    <div className="flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="flex flex-wrap gap-1">
                            {event.assignees.map(a => (
                                <span key={a.id} className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                    a.id === currentUserId ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {a.id === currentUserId ? '✓ Ich' : a.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                        {event.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
                        ))}
                    </div>
                )}

                {/* Beschreibung */}
                {event.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 pt-1 border-t border-gray-100">{event.description}</p>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 flex gap-2">
                <button onClick={() => router.visit(route('calendar.show', event.id))}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium">Details →</button>
                <button onClick={() => router.visit(route('calendar.edit', event.id))}
                    className="text-xs text-gray-500 hover:text-gray-700">Bearbeiten</button>
            </div>
        </div>
    );
}

export default function CalendarIndex({ events, projects, customers, users }) {
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '', description: '', event_type: 'meeting',
        start: '', end: '', all_day: false,
        project_id: '', customer_id: '',
        assigned_users: [], tags: [],
    });

    const [showModal, setShowModal] = useState(false);
    const [tagInput, setTagInput]   = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tooltip, setTooltip] = useState({ event: null, pos: { x: 0, y: 0 } });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('calendar.store'), {
            onSuccess: () => { setShowModal(false); reset(); setTagInput(''); }
        });
    };

    const addTag    = (tag) => { const t = tag.trim(); if (t && !data.tags.includes(t)) setData('tags', [...data.tags, t]); setTagInput(''); };
    const removeTag = (tag) => setData('tags', data.tags.filter(t => t !== tag));

    // Calendar helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear(), month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay  = new Date(year, month + 1, 0);
        const days = [];
        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;
        for (let i = 0; i < startDay; i++) days.push(null);
        for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
        return days;
    };

    const days = getDaysInMonth(currentDate);
    const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

    const getEventsForDay = (day) => {
        if (!day) return [];
        return events.filter(ev => new Date(ev.start).toDateString() === day.toDateString());
    };

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const showTooltip = (e, ev) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({ event: ev, pos: { x: rect.left, y: rect.bottom } });
    };
    const hideTooltip = () => setTooltip({ event: null, pos: { x: 0, y: 0 } });

    return (
        <DashboardLayout title="Kalender">
            <Head title="Kalender" />

            <PageHeader
                title="Kalender"
                subtitle="Termine und Events verwalten"
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Neuer Termin
                    </Button>
                }
            />

            {/* Event Type Legend */}
            <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
                    <span key={type} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${EVENT_TYPE_COLORS[type]}`}>
                        <span className="w-2 h-2 rounded-full bg-current opacity-70 flex-shrink-0" />
                        {label}
                    </span>
                ))}
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(currentDate)}
                    </h2>
                    <div className="flex gap-2">
                        <IconButton onClick={prevMonth}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </IconButton>
                        <button onClick={() => setCurrentDate(new Date())}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Heute</button>
                        <IconButton onClick={nextMonth}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </IconButton>
                    </div>
                </div>

                {/* Grid */}
                <div className="p-4">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map(d => (
                            <div key={d} className="text-center text-sm font-medium text-gray-500 py-2">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => {
                            const dayEvents = getEventsForDay(day);
                            const isToday = day && day.toDateString() === new Date().toDateString();
                            const hasMyEvent = dayEvents.some(ev => ev.assignees?.some(a => a.id === currentUserId));
                            return (
                                <div key={index} className={`min-h-[100px] border rounded-xl p-1.5 transition-shadow ${
                                    !day ? 'bg-gray-50' :
                                    isToday ? 'border-primary-400 ring-2 ring-primary-100 bg-white' :
                                    hasMyEvent ? 'border-primary-200 bg-primary-50/30' :
                                    'border-gray-100 bg-white hover:shadow-sm'
                                }`}>
                                    {day && (
                                        <>
                                            <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                                                isToday ? 'bg-primary-600 text-white' : 'text-gray-600'
                                            }`}>
                                                {day.getDate()}
                                            </div>
                                            <div className="space-y-0.5">
                                                {dayEvents.slice(0, 3).map(ev => {
                                                    const isMine = ev.assignees?.some(a => a.id === currentUserId);
                                                    return (
                                                        <div key={ev.id}
                                                            className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-90 transition-opacity border ${
                                                                isMine
                                                                    ? 'bg-primary-600 text-white border-primary-700 font-medium'
                                                                    : (EVENT_TYPE_COLORS[ev.event_type] || 'bg-gray-100 text-gray-700 border-gray-200')
                                                            }`}
                                                            onClick={() => router.visit(route('calendar.show', ev.id))}
                                                            onMouseEnter={(e) => showTooltip(e, ev)}
                                                            onMouseLeave={hideTooltip}
                                                        >
                                                            {isMine && <span className="mr-0.5">●</span>}
                                                            {ev.title}
                                                            {ev.assignees?.length > 0 && (
                                                                <span className="ml-1 opacity-70">({ev.assignees.length})</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {dayEvents.length > 3 && (
                                                    <div className="text-xs text-gray-400 pl-1">+{dayEvents.length - 3} mehr</div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Hover Tooltip */}
            <EventTooltip
                event={tooltip.event}
                pos={tooltip.pos}
                currentUserId={currentUserId}
                onClose={hideTooltip}
            />

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-semibold text-gray-900">Neuer Termin</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Terminart</label>
                                    <select value={data.event_type} onChange={e => setData('event_type', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        <option value="meeting">Meeting</option>
                                        <option value="deadline">Deadline</option>
                                        <option value="call">Anruf</option>
                                        <option value="delivery">Lieferung</option>
                                        <option value="pickup">Abholung</option>
                                        <option value="reminder">Erinnerung</option>
                                        <option value="other">Sonstiges</option>
                                    </select>
                                </div>
                                <div className="flex items-center mt-6">
                                    <input type="checkbox" id="modal_all_day" checked={data.all_day}
                                        onChange={e => setData('all_day', e.target.checked)}
                                        className="h-4 w-4 text-primary-600 border-gray-300 rounded" />
                                    <label htmlFor="modal_all_day" className="ml-2 text-sm text-gray-700">Ganztägig</label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start *</label>
                                    <input type="datetime-local" value={data.start} onChange={e => setData('start', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
                                    {errors.start && <p className="text-red-500 text-xs mt-1">{errors.start}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ende</label>
                                    <input type="datetime-local" value={data.end} onChange={e => setData('end', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                                    <select value={data.project_id} onChange={e => setData('project_id', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        <option value="">Kein Projekt</option>
                                        {(projects || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
                                    <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                        <option value="">Kein Kunde</option>
                                        {(customers || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiter</label>
                                <MultiUserSelect users={users || []} selected={data.assigned_users} onChange={val => setData('assigned_users', val)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {PRESET_TAGS.filter(p => !data.tags.includes(p)).map(p => (
                                        <button key={p} type="button" onClick={() => addTag(p)}
                                            className="text-xs px-2 py-0.5 rounded-full border border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-colors">+ {p}</button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                                        placeholder="Eigenen Tag + Enter"
                                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                                </div>
                                {data.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {data.tags.map(tag => (
                                            <span key={tag} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                                                {tag}<button type="button" onClick={() => removeTag(tag)} className="hover:text-primary-900 ml-0.5">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                                    rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Abbrechen</Button>
                                <Button type="submit" disabled={processing}>{processing ? 'Speichern...' : 'Speichern'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
