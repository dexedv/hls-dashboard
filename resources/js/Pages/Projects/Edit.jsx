import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import MultiUserSelect from '@/Components/MultiUserSelect';

export default function ProjectEdit({ project, customers, users }) {
    const { data, setData, put, processing, errors } = useForm({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'planning',
        progress: project.progress || 0,
        budget: project.budget || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        customer_id: project.customer_id || '',
        assigned_users: project.assignees?.map(a => a.id) || [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('projects.update', project.id));
    };

    return (
        <DashboardLayout title={`${project.name} bearbeiten`}>
            <Head title={`${project.name} bearbeiten`} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/projects" className="hover:text-primary-600">Projekte</Link>
                <span>/</span>
                <Link href={route('projects.show', project.id)} className="hover:text-primary-600">{project.name}</Link>
                <span>/</span>
                <span className="text-gray-900">Bearbeiten</span>
            </nav>

            <div className="max-w-2xl">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    rows={3}
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className={`w-full border ${errors.status ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    >
                                        <option value="planning">Planung</option>
                                        <option value="active">Aktiv</option>
                                        <option value="on_hold">Pausiert</option>
                                        <option value="completed">Abgeschlossen</option>
                                        <option value="cancelled">Abgebrochen</option>
                                    </select>
                                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fortschritt (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.progress}
                                        onChange={(e) => setData('progress', e.target.value)}
                                        className={`w-full border ${errors.progress ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    />
                                    {errors.progress && <p className="text-red-500 text-sm mt-1">{errors.progress}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget (EUR)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.budget}
                                        onChange={(e) => setData('budget', e.target.value)}
                                        className={`w-full border ${errors.budget ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    />
                                    {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
                                    <select
                                        value={data.customer_id}
                                        onChange={(e) => setData('customer_id', e.target.value)}
                                        className={`w-full border ${errors.customer_id ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    >
                                        <option value="">Kein Kunde</option>
                                        {customers && customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.customer_id && <p className="text-red-500 text-sm mt-1">{errors.customer_id}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiter (Zugewiesen an)</label>
                                <MultiUserSelect
                                    users={users || []}
                                    selected={data.assigned_users}
                                    onChange={(val) => setData('assigned_users', val)}
                                    error={errors.assigned_users}
                                />
                                {errors.assigned_users && <p className="text-red-500 text-sm mt-1">{errors.assigned_users}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className={`w-full border ${errors.start_date ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    />
                                    {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Enddatum</label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className={`w-full border ${errors.end_date ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    />
                                    {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end mt-6">
                            <Link
                                href={route('projects.show', project.id)}
                                className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                Abbrechen
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                            >
                                Speichern
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
