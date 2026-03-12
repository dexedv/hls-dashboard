import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function LabelsIndex({ labels }) {
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        slug: '',
        color: '#3b82f6',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('labels.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };
    return (
        <DashboardLayout title="Labels">
            <Head title="Labels" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Labels</h1>
                    <p className="text-sm text-gray-500 mt-1">Organisatorische Labels für Mitarbeiter</p>
                </div>
                <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    + Neues Label
                </button>
            </div>

            {/* Labels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {labels && labels.length > 0 ? (
                    labels.map((label) => (
                        <div key={label.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: label.color }}
                                />
                                <h3 className="text-lg font-semibold text-gray-900">{label.name}</h3>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">@{label.slug}</p>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                        <p className="text-gray-500">Keine Labels vorhanden</p>
                        <p className="text-sm text-gray-400 mt-1">Erstellen Sie Labels, um Mitarbeiter zu organisieren</p>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Über Labels</h3>
                <p className="text-sm text-blue-800">
                    Labels dienen zur organisatorischen Einordnung von Mitarbeitern.
                    Anders als Rollen definieren Sie nicht die Berechtigungen,
                    sondern helfen bei der Filterung und Teamstruktur.
                </p>
                <ul className="mt-3 text-sm text-blue-800 space-y-1">
                    <li>• Ein Mitarbeiter kann mehrere Labels haben</li>
                    <li>• Labels helfen bei der Teamfilterung</li>
                    <li>• Beispiele: Außendienst, Innendienst, Produktion, Support</li>
                </ul>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">Neues Label</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded-lg px-4 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                                <input type="text" value={data.slug} onChange={e => setData('slug', e.target.value)} className="w-full border rounded-lg px-4 py-2" placeholder="z.B. aussen-oder-innendienst" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Farbe</label>
                                <div className="flex gap-2">
                                    <input type="color" value={data.color} onChange={e => setData('color', e.target.value)} className="w-12 h-10 border rounded cursor-pointer" />
                                    <input type="text" value={data.color} onChange={e => setData('color', e.target.value)} className="flex-1 border rounded-lg px-4 py-2" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Abbrechen</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Speichern</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
