import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import UserAvatar from '@/Components/UserAvatar';

export default function TeamShow() {
    const { user } = usePage().props;

    const roleColors = {
        owner:    'bg-purple-100 text-purple-700',
        admin:    'bg-red-100 text-red-700',
        manager:  'bg-blue-100 text-blue-700',
        employee: 'bg-green-100 text-green-700',
        viewer:   'bg-gray-100 text-gray-600',
    };

    const roleLabels = {
        owner:    'Inhaber',
        admin:    'Administrator',
        manager:  'Manager',
        employee: 'Mitarbeiter',
        viewer:   'Betrachter',
    };

    return (
        <DashboardLayout title={user.name}>
            <Head title={user.name} />

            <div className="max-w-2xl">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/team" className="text-sm text-gray-500 hover:text-gray-700">Team</Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-sm text-gray-700 font-medium">{user.name}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Link
                            href={route('team.edit', user.id)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Bearbeiten
                        </Link>
                    </div>
                </div>

                {/* Profile card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <UserAvatar user={user} size="xl" />
                        <div>
                            <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.role && (
                                <span className={`mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-600'}`}>
                                    {roleLabels[user.role] || user.role}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 text-sm">
                        {user.phone && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Telefon</p>
                                <p className="text-gray-800">{user.phone}</p>
                            </div>
                        )}
                        {user.position && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Position</p>
                                <p className="text-gray-800">{user.position}</p>
                            </div>
                        )}
                        {user.department && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Abteilung</p>
                                <p className="text-gray-800">{user.department}</p>
                            </div>
                        )}
                        {user.created_at && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Mitglied seit</p>
                                <p className="text-gray-800">{new Date(user.created_at).toLocaleDateString('de-DE')}</p>
                            </div>
                        )}
                    </div>

                    {user.labels && user.labels.length > 0 && (
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Labels</p>
                            <div className="flex flex-wrap gap-2">
                                {user.labels.map(label => (
                                    <span key={label.id} className="text-xs px-2 py-0.5 rounded-full border" style={{ backgroundColor: label.color + '20', color: label.color, borderColor: label.color + '40' }}>
                                        {label.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
