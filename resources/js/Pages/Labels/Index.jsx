import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import EmptyState from '@/Components/EmptyState';
import Modal from '@/Components/Modal';

export default function LabelsIndex({ labels }) {
    const [showModal, setShowModal] = useState(false);
    const [editingLabel, setEditingLabel] = useState(null);
    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        name: '',
        slug: '',
        color: '#3b82f6',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingLabel) {
            put(route('labels.update', editingLabel.id), {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingLabel(null);
                    reset();
                }
            });
        } else {
            post(route('labels.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (label) => {
        setEditingLabel(label);
        setData({
            name: label.name,
            slug: label.slug,
            color: label.color
        });
        setShowModal(true);
    };

    const handleDelete = (labelId) => {
        if (confirm('Sind Sie sicher, dass Sie dieses Label löschen möchten?')) {
            destroy(route('labels.destroy', labelId), {
                onSuccess: () => {
                    // Refresh happens automatically
                }
            });
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingLabel(null);
        reset();
    };

    const handleCreateLabel = () => {
        setEditingLabel(null);
        reset();
        setShowModal(true);
    };

    return (
        <DashboardLayout title="Labels">
            <Head title="Labels" />

            <PageHeader
                title="Labels"
                subtitle="Organisatorische Labels fuer Mitarbeiter"
            >
                <Button onClick={() => setShowModal(true)}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Neues Label
                </Button>
            </PageHeader>

            {/* Labels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {labels && labels.length > 0 ? (
                    labels.map((label) => (
                        <div key={label.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-primary-500 hover:shadow-md transition-all duration-200 group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: label.color }}
                                    />
                                    <h3 className="text-lg font-semibold text-gray-900">{label.name}</h3>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(label)}
                                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        title="Bearbeiten"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(label.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Löschen"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">@{label.slug}</p>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full">
                        <EmptyState
                            title="Keine Labels vorhanden"
                            description="Erstellen Sie Labels, um Mitarbeiter zu organisieren"
                            actionLabel="Neues Label erstellen"
                            onAction={handleCreateLabel}
                        />
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-blue-900">Ueber Labels</h3>
                </div>
                <p className="text-sm text-blue-800">
                    Labels dienen zur organisatorischen Einordnung von Mitarbeitern.
                    Anders als Rollen definieren Sie nicht die Berechtigungen,
                    sondern helfen bei der Filterung und Teamstruktur.
                </p>
                <ul className="mt-3 text-sm text-blue-800 space-y-1">
                    <li>- Ein Mitarbeiter kann mehrere Labels haben</li>
                    <li>- Labels helfen bei der Teamfilterung</li>
                    <li>- Beispiele: Aussendienst, Innendienst, Produktion, Support</li>
                </ul>
            </div>

            {/* Modal */}
            <Modal show={showModal} onClose={handleCloseModal} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingLabel ? 'Label bearbeiten' : 'Neues Label'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {editingLabel ? 'Aktualisieren Sie das Label' : 'Erstellen Sie ein neues Label fuer Ihre Organisation'}
                            </p>
                        </div>
                        <IconButton onClick={handleCloseModal}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </IconButton>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="z.B. Aussendienst"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                            <input
                                type="text"
                                value={data.slug}
                                onChange={e => setData('slug', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="z.B. aussendienst"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Farbe</label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    value={data.color}
                                    onChange={e => setData('color', e.target.value)}
                                    className="w-14 h-10 border border-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                />
                                <input
                                    type="text"
                                    value={data.color}
                                    onChange={e => setData('color', e.target.value)}
                                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="#3b82f6"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="secondary" onClick={handleCloseModal}>
                                Abbrechen
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editingLabel ? 'Aktualisieren' : 'Erstellen'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
