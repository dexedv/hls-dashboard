import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <DashboardLayout title="Profil">
            <Head title="Profil" />

            <div className="max-w-4xl space-y-6">
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

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </DashboardLayout>
    );
}
