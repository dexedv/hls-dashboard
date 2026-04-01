import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

const EVENT_TYPE_LABELS = {
    meeting: 'Meeting', deadline: 'Deadline', call: 'Anruf',
    delivery: 'Lieferung', pickup: 'Abholung', reminder: 'Erinnerung', other: 'Sonstiges',
};
const EVENT_TYPE_COLORS = {
    meeting: 'bg-blue-100 text-blue-700', deadline: 'bg-red-100 text-red-700',
    call: 'bg-green-100 text-green-700', delivery: 'bg-orange-100 text-orange-700',
    pickup: 'bg-purple-100 text-purple-700', reminder: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-700',
};

export default function Edit({ mustVerifyEmail, status, myEvents }) {
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;

    return (
        <DashboardLayout title="Profil">
            <Head title="Profil" />

            <div className="max-w-4xl space-y-6">
                {/* Profile info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                {/* My upcoming events */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-primary-50/50 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h2 className="text-base font-semibold text-gray-900">Meine kommenden Termine</h2>
                        {myEvents && myEvents.length > 0 && (
                            <span className="ml-auto text-xs bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full">{myEvents.length}</span>
                        )}
                    </div>

                    {!myEvents || myEvents.length === 0 ? (
                        <div className="px-6 py-8 text-center text-sm text-gray-400">
                            Du bist in keinen kommenden Terminen eingeladen.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {myEvents.map(ev => {
                                const d = new Date(ev.start);
                                const isToday = d.toDateString() === new Date().toDateString();
                                const timeLabel = ev.all_day ? 'Ganztägig' : d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <Link key={ev.id} href={route('calendar.show', ev.id)}
                                        className="flex items-start gap-4 px-6 py-3.5 hover:bg-primary-50/30 transition-colors group border-l-4 border-l-primary-400">
                                        {/* Date block */}
                                        <div className={`flex-shrink-0 text-center w-12 rounded-lg py-1 ${isToday ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700'}`}>
                                            <div className="text-xs font-medium">{d.toLocaleDateString('de-DE', { weekday: 'short' })}</div>
                                            <div className="text-lg font-bold leading-tight">{d.getDate()}</div>
                                            <div className="text-xs opacity-75">{d.toLocaleDateString('de-DE', { month: 'short' })}</div>
                                        </div>
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{ev.title}</p>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                <span className="text-xs text-gray-500">{timeLabel}</span>
                                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${EVENT_TYPE_COLORS[ev.event_type] || 'bg-gray-100 text-gray-700'}`}>
                                                    {EVENT_TYPE_LABELS[ev.event_type] || ev.event_type}
                                                </span>
                                                {ev.tags && ev.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="text-xs px-1.5 py-0.5 bg-primary-50 text-primary-600 rounded font-medium">{tag}</span>
                                                ))}
                                            </div>
                                            {(ev.project_name || ev.customer_name) && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {ev.project_name && <span>📁 {ev.project_name}</span>}
                                                    {ev.project_name && ev.customer_name && <span className="mx-1">·</span>}
                                                    {ev.customer_name && <span>👤 {ev.customer_name}</span>}
                                                </p>
                                            )}
                                        </div>
                                        {/* Other assignees */}
                                        {ev.assignees && ev.assignees.length > 0 && (
                                            <div className="flex-shrink-0 flex -space-x-1">
                                                {ev.assignees.slice(0, 4).map(a => {
                                                    const isMe = a.id === currentUserId;
                                                    return (
                                                        <span key={a.id} title={isMe ? 'Ich' : a.name}
                                                            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white ${isMe ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                            {a.name?.[0]?.toUpperCase()}
                                                        </span>
                                                    );
                                                })}
                                                {ev.assignees.length > 4 && (
                                                    <span className="h-6 w-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold border-2 border-white">
                                                        +{ev.assignees.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                        <Link href={route('calendar.index')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            Alle Termine anzeigen →
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </DashboardLayout>
    );
}
