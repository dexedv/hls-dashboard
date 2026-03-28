import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

export default function ProjectsIndex({ projects, customers, filters, statuses = [], priorities = [] }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing } = useForm({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        progress: 0,
        budget: '',
        start_date: '',
        end_date: '',
        customer_id: '',
    });

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        const url = new URL(route('projects.index'));
        if (search) url.searchParams.set('search', search);
        router.visit(url.toString());
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('projects.store'), {
            onSuccess: () => {
                setShowModal(false);
                setData({ name: '', description: '', status: 'planning', priority: 'medium', progress: 0, budget: '', start_date: '', end_date: '', customer_id: '' });
            }
        });
    };

    // Dynamic status lookup from props
    const getStatusInfo = (statusValue) => {
        const status = statuses.find(s => s.value === statusValue);
        return status ? { color: status.color, label: status.label } : { color: 'bg-gray-100 text-gray-800', label: statusValue };
    };

    return (
        <DashboardLayout title="Projekte">
            <Head title="Projekte" />

            {/* Page Header */}
            <PageHeader
                title="Projekte"
                subtitle="Verwalten Sie Ihre Projekte"
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Neues Projekt
                    </Button>
                }
            >
                <div className="mt-4">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        onSubmit={handleSearch}
                        placeholder="Projekte suchen..."
                    />
                </div>
            </PageHeader>

            {/* Projects Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {projects.data.length === 0 ? (
                    <div className="px-6 py-12">
                        <EmptyState
                            title="Noch keine Projekte vorhanden"
                            description="Erstellen Sie Ihr erstes Projekt, um zu beginnen."
                            actionLabel="Erstes Projekt anlegen"
                            onAction={() => setShowModal(true)}
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop Grid */}
                        <div className="hidden md:block p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projects.data.map((project) => {
                                    const isAssignedToMe = project.assignees?.some(a => a.id === auth?.user?.id);
                                    return (
                                    <Link
                                        key={project.id}
                                        href={route('projects.show', project.id)}
                                        className={`rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
                                            isAssignedToMe
                                                ? 'border-2 border-primary-400 bg-primary-50/50 hover:bg-primary-50'
                                                : 'border border-gray-100 dark:border-gray-700 hover:border-primary-200 hover:bg-primary-50/30 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">{project.name}</h3>
                                                {isAssignedToMe && (
                                                    <span className="text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded font-medium flex-shrink-0">Ich</span>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${getStatusInfo(project.status).color}`}>
                                                {getStatusInfo(project.status).label}
                                            </span>
                                        </div>
                                        {project.customer && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{project.customer.name}</p>
                                        )}
                                        {project.assignees && project.assignees.length > 0 && (
                                            <div className="flex items-center gap-1 mb-2">
                                                {project.assignees.slice(0, 4).map(a => (
                                                    <span key={a.id} title={a.name} className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white -ml-1 first:ml-0 ${
                                                        a.id === auth?.user?.id
                                                            ? 'bg-primary-600 text-white ring-2 ring-primary-400'
                                                            : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                        {a.name?.[0]?.toUpperCase()}
                                                    </span>
                                                ))}
                                                {project.assignees.length > 4 && (
                                                    <span className="text-xs text-gray-500 ml-1">+{project.assignees.length - 4}</span>
                                                )}
                                            </div>
                                        )}
                                        {project.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{project.description}</p>
                                        )}
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="text-gray-500 dark:text-gray-400">Fortschritt: {project.progress}%</span>
                                            {project.budget && (
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {parseFloat(project.budget).toLocaleString('de-DE')} €
                                                </span>
                                            )}
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className="bg-primary-600 h-2 rounded-full"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                    </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                            {projects.data.map((project) => (
                                <Link key={project.id} href={route('projects.show', project.id)} className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600">{project.name}</h3>
                                            {project.customer && <p className="text-sm text-gray-500 dark:text-gray-400">{project.customer.name}</p>}
                                            {project.assignees && project.assignees.length > 0 && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    {project.assignees.map(a => a.name).join(', ')}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusInfo(project.status).color}`}>
                                            {getStatusInfo(project.status).label}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 max-w-[120px]">
                                                <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{project.progress}%</span>
                                        </div>
                                        {project.budget && (
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {parseFloat(project.budget).toLocaleString('de-DE')} €
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                <Pagination links={projects.links} from={projects.from} to={projects.to} total={projects.total} entityName="Projekten" />
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Neues Projekt</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kunde</label>
                                    <select
                                        value={data.customer_id}
                                        onChange={(e) => setData('customer_id', e.target.value)}
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    >
                                        <option value="">Kein Kunde</option>
                                        {customers && customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        >
                                            <option value="planning">Planung</option>
                                            <option value="active">Aktiv</option>
                                            <option value="on_hold">Pausiert</option>
                                            <option value="completed">Abgeschlossen</option>
                                            <option value="cancelled">Abgebrochen</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priorität</label>
                                        <select
                                            value={data.priority}
                                            onChange={(e) => setData('priority', e.target.value)}
                                            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        >
                                            <option value="low">Niedrig</option>
                                            <option value="medium">Mittel</option>
                                            <option value="high">Hoch</option>
                                            <option value="urgent">Dringend</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget (EUR)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.budget}
                                        onChange={(e) => setData('budget', e.target.value)}
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum</label>
                                        <input
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enddatum</label>
                                        <input
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <Button variant="secondary" onClick={() => setShowModal(false)}>
                                    Abbrechen
                                </Button>
                                <Button disabled={processing}>
                                    Speichern
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
