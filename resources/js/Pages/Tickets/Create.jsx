import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import MultiUserSelect from '@/Components/MultiUserSelect';

export default function Create() {
    const { customers, projects, users } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        category: 'support',
        priority: 'medium',
        customer_id: '',
        project_id: '',
        assigned_users: [],
        sla_hours: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/tickets');
    };

    return (
        <DashboardLayout title="Neues Ticket">
            <Head title="Neues Ticket" />

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Neues Ticket</h1>
                        <p className="text-sm text-gray-500 mt-1">Erstellen Sie ein neues Support-Ticket</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/tickets"
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
                                className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                required
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className={`w-full border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            >
                                <option value="support">Support</option>
                                <option value="bug">Fehler</option>
                                <option value="feature">Feature-Request</option>
                                <option value="billing">Abrechnung</option>
                                <option value="other">Sonstiges</option>
                            </select>
                            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
                            <select
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                className={`w-full border ${errors.priority ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            >
                                <option value="low">Niedrig</option>
                                <option value="medium">Mittel</option>
                                <option value="high">Hoch</option>
                                <option value="critical">Kritisch</option>
                            </select>
                            {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
                            <select
                                value={data.customer_id}
                                onChange={(e) => setData('customer_id', e.target.value)}
                                className={`w-full border ${errors.customer_id ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                            <select value={data.project_id} onChange={(e) => setData('project_id', e.target.value)}
                                className={`w-full border ${errors.project_id ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}>
                                <option value="">Kein Projekt</option>
                                {projects && projects.map((project) => (
                                    <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                            </select>
                            {errors.project_id && <p className="text-red-500 text-sm mt-1">{errors.project_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SLA (Stunden)</label>
                            <select value={data.sla_hours} onChange={e => setData('sla_hours', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 text-sm">
                                <option value="">Kein SLA</option>
                                <option value="4">4 Stunden (kritisch)</option>
                                <option value="8">8 Stunden (1 Werktag)</option>
                                <option value="24">24 Stunden</option>
                                <option value="48">48 Stunden (2 Werktage)</option>
                                <option value="72">72 Stunden (3 Werktage)</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiter (Zugewiesen an)</label>
                            <MultiUserSelect
                                users={users || []}
                                selected={data.assigned_users}
                                onChange={(val) => setData('assigned_users', val)}
                                error={errors.assigned_users}
                            />
                            {errors.assigned_users && <p className="text-red-500 text-sm mt-1">{errors.assigned_users}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung *</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={6}
                                className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                required
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
