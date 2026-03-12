import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

export default function SettingsIndex() {
    return (
        <DashboardLayout title="Einstellungen">
            <Head title="Einstellungen" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
                <p className="text-sm text-gray-500 mt-1">Systemeinstellungen</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    href="/profile"
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:border-primary-500 transition"
                >
                    <h3 className="text-lg font-semibold text-gray-900">Profil</h3>
                    <p className="text-sm text-gray-500 mt-1">Persönliche Daten ändern</p>
                </Link>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Allgemein</h3>
                    <p className="text-sm text-gray-500 mt-1">Coming soon...</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
