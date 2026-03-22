import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';

export default function Create() {
    const { projects, customers } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        event_type: 'meeting',
        start: '',
        end: '',
        all_day: false,
        project_id: '',
        customer_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/calendar');
    };

    return (
        <DashboardLayout title="Neuer Termin">
            <Head title="Neuer Termin" />

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Neuer Termin</h1>
                        <p className="text-sm text-gray-500 mt-1">Erstellen Sie einen neuen Termin</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/calendar"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Abbrechen
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                            {processing ? 'Speichern...' : 'Speichern'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                                required
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Terminart</label>
                            <select
                                value={data.event_type}
                                onChange={(e) => setData('event_type', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
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
                            <input
                                type="checkbox"
                                id="all_day"
                                checked={data.all_day}
                                onChange={(e) => setData('all_day', e.target.checked)}
                                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="all_day" className="ml-2 text-sm text-gray-700">Ganztägig</label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start *</label>
                            <input
                                type="datetime-local"
                                value={data.start}
                                onChange={(e) => setData('start', e.target.value)}
                                className={`w-full border ${errors.start ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                                required
                            />
                            {errors.start && <p className="text-red-500 text-sm mt-1">{errors.start}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ende *</label>
                            <input
                                type="datetime-local"
                                value={data.end}
                                onChange={(e) => setData('end', e.target.value)}
                                className={`w-full border ${errors.end ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                                required
                            />
                            {errors.end && <p className="text-red-500 text-sm mt-1">{errors.end}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                            <select
                                value={data.project_id}
                                onChange={(e) => setData('project_id', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Kein Projekt</option>
                                {projects && projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
                            <select
                                value={data.customer_id}
                                onChange={(e) => setData('customer_id', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Kein Kunde</option>
                                {customers && customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
