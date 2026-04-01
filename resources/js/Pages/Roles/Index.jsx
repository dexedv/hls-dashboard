import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import PageHeader, { Button } from '@/Components/PageHeader';

// ─── Role metadata ────────────────────────────────────────────────────────────
const ROLE_META = {
    owner:    { color: 'purple', desc: 'Vollzugriff auf alle Module und Einstellungen', icon: '👑' },
    admin:    { color: 'red',    desc: 'Verwaltung aller Bereiche und Benutzer',        icon: '🛡️' },
    manager:  { color: 'blue',   desc: 'Projekt- und Teamführung mit breitem Zugriff',  icon: '📋' },
    employee: { color: 'green',  desc: 'Tagesgeschäft: Aufgaben, Projekte, Zeiten',     icon: '👤' },
    support:  { color: 'orange', desc: 'Ticketbearbeitung und Kundenkommunikation',     icon: '🎧' },
    finance:  { color: 'yellow', desc: 'Rechnungen, Angebote und Finanzverwaltung',     icon: '💰' },
    sales:    { color: 'pink',   desc: 'Vertrieb, Leads und Kundenakquise',             icon: '📈' },
    guest:    { color: 'gray',   desc: 'Nur Dashboard, kein Bearbeitungsrecht',         icon: '👁️' },
};

const ROLE_COLORS = {
    purple: { card: 'border-purple-300 bg-purple-50',  badge: 'bg-purple-100 text-purple-800', bar: 'bg-purple-500', ring: 'ring-purple-400' },
    red:    { card: 'border-red-300 bg-red-50',        badge: 'bg-red-100 text-red-800',       bar: 'bg-red-500',    ring: 'ring-red-400' },
    blue:   { card: 'border-blue-300 bg-blue-50',      badge: 'bg-blue-100 text-blue-800',     bar: 'bg-blue-500',   ring: 'ring-blue-400' },
    green:  { card: 'border-green-300 bg-green-50',    badge: 'bg-green-100 text-green-800',   bar: 'bg-green-500',  ring: 'ring-green-400' },
    orange: { card: 'border-orange-300 bg-orange-50',  badge: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500', ring: 'ring-orange-400' },
    yellow: { card: 'border-yellow-300 bg-yellow-50',  badge: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500', ring: 'ring-yellow-400' },
    pink:   { card: 'border-pink-300 bg-pink-50',      badge: 'bg-pink-100 text-pink-800',     bar: 'bg-pink-500',   ring: 'ring-pink-400' },
    gray:   { card: 'border-gray-300 bg-gray-50',      badge: 'bg-gray-100 text-gray-800',     bar: 'bg-gray-400',   ring: 'ring-gray-400' },
};

// ─── Module categories with German names & icons ──────────────────────────────
const CATEGORIES = [
    {
        key: 'crm',
        label: 'CRM & Vertrieb',
        color: 'blue',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        modules: ['crm', 'leads', 'email'],
    },
    {
        key: 'work',
        label: 'Projekte & Arbeit',
        color: 'green',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
        modules: ['projects', 'tasks', 'calendar', 'time_tracking', 'notes', 'tickets'],
    },
    {
        key: 'finance',
        label: 'Finanzen',
        color: 'emerald',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        modules: ['finances', 'invoices', 'quotes', 'statistics'],
    },
    {
        key: 'warehouse',
        label: 'Lager & Betrieb',
        color: 'orange',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
        modules: ['inventory', 'wms', 'barcode', 'leave'],
    },
    {
        key: 'admin',
        label: 'Administration',
        color: 'purple',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        modules: ['dashboard', 'team', 'users', 'roles', 'permissions', 'labels', 'settings', 'integrations', 'audit_logs', 'system'],
    },
];

const CATEGORY_COLORS = {
    blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    icon: 'bg-blue-100 text-blue-600',    toggle: 'bg-blue-600' },
    green:   { bg: 'bg-green-50',   border: 'border-green-200',   text: 'text-green-700',   icon: 'bg-green-100 text-green-600',   toggle: 'bg-green-600' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'bg-emerald-100 text-emerald-600', toggle: 'bg-emerald-600' },
    orange:  { bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-700',  icon: 'bg-orange-100 text-orange-600',  toggle: 'bg-orange-600' },
    purple:  { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700',  icon: 'bg-purple-100 text-purple-600',  toggle: 'bg-purple-600' },
};

const MODULE_NAMES = {
    dashboard: 'Dashboard', crm: 'Kunden (CRM)', leads: 'Leads', projects: 'Projekte',
    tasks: 'Aufgaben', calendar: 'Kalender', finances: 'Finanzen', invoices: 'Rechnungen',
    quotes: 'Angebote', time_tracking: 'Zeiterfassung', team: 'Team', leave: 'Urlaub & Abwesenheit',
    notes: 'Notizen', inventory: 'Inventar', wms: 'Warenwirtschaft', barcode: 'Barcode & Etiketten',
    statistics: 'Statistiken', tickets: 'Tickets', email: 'E-Mail', users: 'Benutzer',
    roles: 'Rollen', permissions: 'Berechtigungen', labels: 'Labels', settings: 'Einstellungen',
    integrations: 'Integrationen', audit_logs: 'Audit-Logs', system: 'System',
};

export default function RolesIndex({ roles, permissions, rolePermissions }) {
    const [selectedRole, setSelectedRole] = useState('manager');
    const [saving, setSaving] = useState(false);
    const [localPermissions, setLocalPermissions] = useState(rolePermissions);
    const [openCategories, setOpenCategories] = useState({ crm: true, work: true, finance: true, warehouse: true, admin: true });
    const [search, setSearch] = useState('');
    const [filterMode, setFilterMode] = useState('all'); // 'all' | 'enabled' | 'disabled'

    // Track which permissions have changed from the original (unsaved changes)
    const [originalPermissions] = useState(rolePermissions);

    const changedKeys = useMemo(() => {
        const orig = originalPermissions[selectedRole] || {};
        const curr = localPermissions[selectedRole] || {};
        return new Set(
            Object.keys({ ...orig, ...curr }).filter(k => !!orig[k] !== !!curr[k])
        );
    }, [localPermissions, selectedRole, originalPermissions]);

    // Total permission count
    const totalPerms = useMemo(() => {
        let total = 0;
        Object.values(permissions).forEach(m => { total += Object.keys(m).length; });
        return total;
    }, [permissions]);

    const handleToggle = (permKey) => {
        setLocalPermissions(prev => ({
            ...prev,
            [selectedRole]: {
                ...prev[selectedRole],
                [permKey]: !prev[selectedRole]?.[permKey],
            },
        }));
    };

    const handleModuleToggleAll = (modulePerms, enable) => {
        const updates = {};
        Object.keys(modulePerms).forEach(k => { updates[k] = enable; });
        setLocalPermissions(prev => ({
            ...prev,
            [selectedRole]: { ...prev[selectedRole], ...updates },
        }));
    };

    const handleCategoryToggleAll = (category, enable) => {
        const updates = {};
        category.modules.forEach(mod => {
            if (permissions[mod]) {
                Object.keys(permissions[mod]).forEach(k => { updates[k] = enable; });
            }
        });
        setLocalPermissions(prev => ({
            ...prev,
            [selectedRole]: { ...prev[selectedRole], ...updates },
        }));
    };

    const handleSave = () => {
        setSaving(true);
        router.post('/roles/permissions', {
            role: selectedRole,
            permissions: localPermissions[selectedRole],
        }, { onFinish: () => setSaving(false) });
    };

    const handleReset = () => {
        if (!confirm('Möchten Sie diese Rolle wirklich auf die Standardwerte zurücksetzen?')) return;
        setSaving(true);
        router.post('/roles/reset', { role: selectedRole }, { onFinish: () => setSaving(false) });
    };

    const getRolePermCount = (role) =>
        Object.values(localPermissions[role] || {}).filter(Boolean).length;

    const getRolePercent = (role) =>
        totalPerms > 0 ? Math.round((getRolePermCount(role) / totalPerms) * 100) : 0;

    // Filter permissions for display
    const getFilteredModulePerms = (modulePerms) => {
        return Object.entries(modulePerms).filter(([key, label]) => {
            const matchesSearch = !search ||
                label.toLowerCase().includes(search.toLowerCase()) ||
                key.toLowerCase().includes(search.toLowerCase());
            const enabled = !!localPermissions[selectedRole]?.[key];
            const matchesFilter = filterMode === 'all' || (filterMode === 'enabled' ? enabled : !enabled);
            return matchesSearch && matchesFilter;
        });
    };

    const isReadOnly = selectedRole === 'owner' || selectedRole === 'admin';

    return (
        <DashboardLayout title="Rollen & Berechtigungen">
            <Head title="Rollen & Berechtigungen" />

            <PageHeader
                title="Rollen & Berechtigungen"
                subtitle="Verwalten Sie Zugriffsrechte für jede Rolle"
            />

            {/* ── Role Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
                {Object.entries(roles).map(([slug, name]) => {
                    const meta = ROLE_META[slug] || { color: 'gray', desc: '', icon: '●' };
                    const clr = ROLE_COLORS[meta.color] || ROLE_COLORS.gray;
                    const pct = getRolePercent(slug);
                    const count = getRolePermCount(slug);
                    const isSelected = selectedRole === slug;

                    return (
                        <button
                            key={slug}
                            onClick={() => setSelectedRole(slug)}
                            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                                isSelected
                                    ? `${clr.card} ring-2 ${clr.ring} ring-offset-1 shadow-md`
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                            }`}
                        >
                            {/* Icon + Name */}
                            <div className="flex items-start justify-between gap-1 mb-2">
                                <span className="text-xl leading-none">{meta.icon}</span>
                                {isSelected && (
                                    <span className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0 mt-1" />
                                )}
                            </div>
                            <p className="text-sm font-bold text-gray-900 leading-tight mb-0.5">{name}</p>
                            <p className="text-xs text-gray-400 leading-tight mb-3 line-clamp-2">{meta.desc}</p>

                            {/* Progress bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{count} Rechte</span>
                                    <span className="text-xs font-semibold text-gray-600">{pct}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${clr.bar}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* ── Permission Editor ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">

                {/* Sticky header */}
                <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm rounded-t-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xl">{ROLE_META[selectedRole]?.icon}</span>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {roles[selectedRole]}
                                </h2>
                                {isReadOnly && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                                        Alle Rechte — nicht editierbar
                                    </span>
                                )}
                                {changedKeys.size > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold border border-amber-200">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        {changedKeys.size} ungespeicherte Änderung{changedKeys.size !== 1 ? 'en' : ''}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{ROLE_META[selectedRole]?.desc}</p>
                        </div>

                        {/* Search + Filter */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="relative">
                                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Suchen..."
                                    className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-40"
                                />
                            </div>
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
                                {[['all','Alle'],['enabled','Aktiv'],['disabled','Inaktiv']].map(([val, label]) => (
                                    <button
                                        key={val}
                                        onClick={() => setFilterMode(val)}
                                        className={`px-3 py-1.5 transition-colors ${
                                            filterMode === val
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Save / Reset */}
                        {!isReadOnly && (
                            <div className="flex gap-2 flex-shrink-0">
                                <button
                                    onClick={handleReset}
                                    disabled={saving}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Zurücksetzen
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || changedKeys.size === 0}
                                    className="px-4 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                            Speichern...
                                        </>
                                    ) : (
                                        <>
                                            {changedKeys.size > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />}
                                            Speichern
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category sections */}
                <div className="p-4 space-y-3 max-h-[65vh] overflow-y-auto">
                    {CATEGORIES.map((cat) => {
                        const clr = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.blue;
                        const isOpen = openCategories[cat.key];

                        // Gather all permission keys in this category
                        const catPermKeys = [];
                        cat.modules.forEach(mod => {
                            if (permissions[mod]) Object.keys(permissions[mod]).forEach(k => catPermKeys.push(k));
                        });
                        const catEnabled = catPermKeys.filter(k => !!localPermissions[selectedRole]?.[k]).length;
                        const catChanged = catPermKeys.filter(k => changedKeys.has(k)).length;

                        // Check if there's anything to show after filtering
                        const hasVisiblePerms = cat.modules.some(mod =>
                            permissions[mod] && getFilteredModulePerms(permissions[mod]).length > 0
                        );
                        if (!hasVisiblePerms) return null;

                        return (
                            <div key={cat.key} className={`rounded-xl border ${clr.border} overflow-hidden`}>
                                {/* Category header */}
                                <div className={`${clr.bg} px-4 py-3 flex items-center gap-3`}>
                                    <button
                                        onClick={() => setOpenCategories(p => ({ ...p, [cat.key]: !p[cat.key] }))}
                                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                    >
                                        <div className={`h-7 w-7 rounded-lg ${clr.icon} flex items-center justify-center flex-shrink-0`}>
                                            {cat.icon}
                                        </div>
                                        <span className={`font-semibold text-sm ${clr.text}`}>{cat.label}</span>
                                        <span className="text-xs text-gray-400 font-normal">
                                            {catEnabled}/{catPermKeys.length}
                                        </span>
                                        {catChanged > 0 && (
                                            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-semibold border border-amber-200">
                                                {catChanged}×
                                            </span>
                                        )}
                                        <svg className={`ml-auto w-4 h-4 ${clr.text} transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Category-level toggle all */}
                                    {!isReadOnly && (
                                        <div className="flex gap-1.5 flex-shrink-0">
                                            <button
                                                onClick={() => handleCategoryToggleAll(cat, true)}
                                                className="text-xs px-2 py-1 rounded bg-white/70 hover:bg-white text-gray-600 hover:text-gray-900 border border-white/50 font-medium transition-colors"
                                            >
                                                Alle an
                                            </button>
                                            <button
                                                onClick={() => handleCategoryToggleAll(cat, false)}
                                                className="text-xs px-2 py-1 rounded bg-white/70 hover:bg-white text-gray-600 hover:text-gray-900 border border-white/50 font-medium transition-colors"
                                            >
                                                Alle aus
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Modules inside category */}
                                {isOpen && (
                                    <div className="divide-y divide-gray-50">
                                        {cat.modules.map((modKey) => {
                                            const modPerms = permissions[modKey];
                                            if (!modPerms) return null;
                                            const filtered = getFilteredModulePerms(modPerms);
                                            if (filtered.length === 0) return null;

                                            const modEnabled = Object.keys(modPerms).filter(k => !!localPermissions[selectedRole]?.[k]).length;
                                            const modChanged = Object.keys(modPerms).filter(k => changedKeys.has(k)).length;

                                            return (
                                                <div key={modKey} className="px-4 py-3">
                                                    {/* Module sub-header */}
                                                    <div className="flex items-center gap-2 mb-2.5">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                                            {MODULE_NAMES[modKey] || modKey}
                                                        </h4>
                                                        <span className="text-xs text-gray-300">{modEnabled}/{Object.keys(modPerms).length}</span>
                                                        {modChanged > 0 && (
                                                            <span className="text-xs px-1 bg-amber-50 text-amber-600 rounded font-semibold border border-amber-200">
                                                                {modChanged}×
                                                            </span>
                                                        )}
                                                        {!isReadOnly && (
                                                            <div className="ml-auto flex gap-1">
                                                                <button onClick={() => handleModuleToggleAll(modPerms, true)} className="text-xs text-gray-400 hover:text-primary-600 px-1.5 py-0.5 rounded hover:bg-primary-50 transition-colors">
                                                                    Alle an
                                                                </button>
                                                                <button onClick={() => handleModuleToggleAll(modPerms, false)} className="text-xs text-gray-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors">
                                                                    Alle aus
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Permission toggles */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5">
                                                        {filtered.map(([key, label]) => {
                                                            const enabled = !!localPermissions[selectedRole]?.[key];
                                                            const changed = changedKeys.has(key);

                                                            return (
                                                                <label
                                                                    key={key}
                                                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all group border ${
                                                                        isReadOnly
                                                                            ? enabled
                                                                                ? 'bg-green-50 border-green-100 cursor-default'
                                                                                : 'bg-gray-50 border-transparent cursor-default'
                                                                            : changed
                                                                                ? enabled
                                                                                    ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                                                                                    : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                                                                                : enabled
                                                                                    ? 'bg-green-50 border-green-100 hover:bg-green-100'
                                                                                    : 'bg-gray-50 border-transparent hover:bg-gray-100'
                                                                    }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={enabled}
                                                                        onChange={() => !isReadOnly && handleToggle(key)}
                                                                        disabled={isReadOnly}
                                                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                                                                    />
                                                                    <span className={`text-xs leading-tight ${
                                                                        enabled ? 'text-gray-800 font-medium' : 'text-gray-500'
                                                                    }`}>
                                                                        {label}
                                                                    </span>
                                                                    {changed && (
                                                                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                                                    )}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Role info cards ── */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { slug: 'owner',   note: 'Kann nicht eingeschränkt werden' },
                    { slug: 'admin',   note: 'Volle Administrationsrechte' },
                    { slug: 'manager', note: 'Geeignet für Teamleiter' },
                    { slug: 'employee',note: 'Standard für alle Mitarbeiter' },
                ].map(({ slug, note }) => {
                    const meta = ROLE_META[slug];
                    const clr = ROLE_COLORS[meta.color];
                    return (
                        <div key={slug} className={`rounded-xl border p-4 ${selectedRole === slug ? clr.card : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-base">{meta.icon}</span>
                                <span className="font-semibold text-gray-900 text-sm">{roles[slug]}</span>
                                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${clr.badge}`}>{getRolePercent(slug)}%</span>
                            </div>
                            <p className="text-xs text-gray-500">{meta.desc}</p>
                            <p className="text-xs text-gray-400 mt-1 italic">{note}</p>
                        </div>
                    );
                })}
            </div>
        </DashboardLayout>
    );
}
