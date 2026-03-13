import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';

export default function CalendarIndex({ events, projects }) {
    const [searchQuery, setSearchQuery] = useState('');
    const { data, setData, post, processing } = useForm({
        title: '',
        description: '',
        start: '',
        end: '',
        all_day: false,
        project_id: '',
    });

    const [showModal, setShowModal] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('calendar.store'), {
            onSuccess: () => {
                setShowModal(false);
                setData({ title: '', description: '', start: '', end: '', all_day: false, project_id: '' });
            }
        });
    };

    // Get days in month
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const days = getDaysInMonth(currentDate);
    const monthNames = new Intl.DateTimeFormat('de-DE', { month: 'long' }).formatToParts().filter(p => p.type === 'month').map((_, i) =>
        new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(new Date(2000, i, 1))
    );
    const dayNames = Array.from({ length: 7 }, (_, i) =>
        new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(new Date(2024, 0, i))
    );

    const getEventsForDay = (day) => {
        if (!day) return [];
        return events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.toDateString() === day.toDateString();
        });
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <DashboardLayout title="Kalender">
            <Head title="Kalender" />

            <PageHeader
                title="Kalender"
                subtitle="Verwalten Sie Ihre Termine und Events"
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Neuer Termin
                    </Button>
                }
            >
                <div className="mt-4">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Termine suchen..."
                    />
                </div>
            </PageHeader>

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {/* Calendar Header */}
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
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            Heute
                        </button>
                        <IconButton onClick={nextMonth}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </IconButton>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-4">
                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map(day => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => {
                            const dayEvents = getEventsForDay(day);
                            const isToday = day && day.toDateString() === new Date().toDateString();

                            return (
                                <div key={index} className={`min-h-[100px] border rounded-xl p-1 ${day ? 'bg-white hover:shadow-md' : 'bg-gray-50'} ${isToday ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-100'} transition-shadow`}>
                                    {day && (
                                        <>
                                            <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary-600' : 'text-gray-700'}`}>
                                                {day.getDate()}
                                            </div>
                                            <div className="space-y-1">
                                                {dayEvents.slice(0, 3).map(event => (
                                                    <div key={event.id} className="text-xs p-1 bg-primary-100 text-primary-800 rounded truncate">
                                                        {event.title}
                                                    </div>
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <div className="text-xs text-gray-500">+{dayEvents.length - 3} mehr</div>
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

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Neuer Termin</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                                    <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                                    <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" rows={2} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                                        <input type="datetime-local" value={data.start} onChange={(e) => setData('start', e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ende</label>
                                        <input type="datetime-local" value={data.end} onChange={(e) => setData('end', e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={data.all_day} onChange={(e) => setData('all_day', e.target.checked)} className="rounded" />
                                        <span className="text-sm text-gray-700">Ganztägig</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Abbrechen</Button>
                                <Button type="submit" disabled={processing}>Speichern</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
