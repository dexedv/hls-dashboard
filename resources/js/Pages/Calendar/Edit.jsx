import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import MultiUserSelect from '@/Components/MultiUserSelect';

const PRESET_TAGS = ['Außendienst', 'Innendienst', 'Meeting', 'Reise', 'Schulung', 'Dringend', 'Kundentermin'];

function TagInput({ tags, onChange }) {
    const [input, setInput] = useState('');

    const addTag = (tag) => {
        const t = tag.trim();
        if (t && !tags.includes(t)) onChange([...tags, t]);
        setInput('');
    };

    const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

    return (
        <div>
            <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_TAGS.filter(p => !tags.includes(p)).map(p => (
                    <button key={p} type="button" onClick={() => addTag(p)}
                        className="text-xs px-2 py-0.5 rounded-full border border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50 transition-colors">
                        + {p}
                    </button>
                ))}
            </div>
            <div className="flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(input); } }}
                    placeholder="Tag eingeben + Enter"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                <button type="button" onClick={() => addTag(input)}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm">
                    Hinzufügen
                </button>
            </div>
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-primary-900 ml-0.5">×</button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

const toLocalDatetime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function Edit() {
    const { event, projects, customers, users } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        title:          event.title || '',
        description:    event.description || '',
        event_type:     event.event_type || 'meeting',
        start:          toLocalDatetime(event.start),
        end:            toLocalDatetime(event.end),
        all_day:        event.all_day || false,
        project_id:     event.project_id || '',
        customer_id:    event.customer_id || '',
        assigned_users: event.assignees?.map(a => a.id) || [],
        tags:           event.tags || [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('calendar.update', event.id));
    };

    return (
        <DashboardLayout title="Termin bearbeiten">
            <Head title="Termin bearbeiten" />

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Termin bearbeiten</h1>
                        <p className="text-sm text-gray-500 mt-1">{event.title}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={route('calendar.show', event.id)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Abbrechen
                        </Link>
                        <button type="submit" disabled={processing}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                            {processing ? 'Speichern...' : 'Speichern'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    {/* Titel */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                        <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                            className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                            required />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Terminart */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Terminart</label>
                            <select value={data.event_type} onChange={e => setData('event_type', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <option value="meeting">Meeting</option>
                                <option value="deadline">Deadline</option>
                                <option value="call">Anruf</option>
                                <option value="delivery">Lieferung</option>
                                <option value="pickup">Abholung</option>
                                <option value="reminder">Erinnerung</option>
                                <option value="other">Sonstiges</option>
                            </select>
                        </div>

                        {/* Ganztägig */}
                        <div className="flex items-center mt-6">
                            <input type="checkbox" id="all_day" checked={data.all_day}
                                onChange={e => setData('all_day', e.target.checked)}
                                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                            <label htmlFor="all_day" className="ml-2 text-sm text-gray-700">Ganztägig</label>
                        </div>

                        {/* Start */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start *</label>
                            <input type="datetime-local" value={data.start} onChange={e => setData('start', e.target.value)}
                                className={`w-full border ${errors.start ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                                required />
                            {errors.start && <p className="text-red-500 text-sm mt-1">{errors.start}</p>}
                        </div>

                        {/* Ende */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ende</label>
                            <input type="datetime-local" value={data.end} onChange={e => setData('end', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                        </div>

                        {/* Projekt */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                            <select value={data.project_id} onChange={e => setData('project_id', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <option value="">Kein Projekt</option>
                                {(projects || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        {/* Kunde */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
                            <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                                <option value="">Kein Kunde</option>
                                {(customers || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Mitarbeiter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiter</label>
                        <MultiUserSelect
                            users={users || []}
                            selected={data.assigned_users}
                            onChange={val => setData('assigned_users', val)}
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                        <TagInput tags={data.tags} onChange={val => setData('tags', val)} />
                    </div>

                    {/* Beschreibung */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                        <textarea value={data.description} onChange={e => setData('description', e.target.value)}
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
