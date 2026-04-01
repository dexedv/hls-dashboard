import { Link, usePage, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import ChatButton from '@/Components/ChatButton';
import Toast from '@/Components/Toast';
import UserAvatar from '@/Components/UserAvatar';
import axios from 'axios';

// Time formatting function
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return 'Gerade eben';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `vor ${minutes} Min.`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `vor ${hours} Std.`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
    } else {
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
}

// Icon Components (Heroicons)
const Icons = {
    dashboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    customers: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    leads: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>),
    quotes: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
    invoices: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>),
    finances: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
    projects: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>),
    tasks: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>),
    timeTracking: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
    calendar: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
    vacation: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
    notes: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>),
    tickets: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>),
    email: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>),
    inventory: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>),
    products: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>),
    expenses: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>),
    contracts: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
    kb: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>),
    hoursReport: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
    warehouse: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>),
    barcode: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>),
    statistics: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
    team: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>),
    settings: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
    users: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>),
    roles: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>),
    labels: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>),
    auditLogs: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>),
    integrations: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>),
    database: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>),
    myAssignments: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>),
};

const navigation = [
    { name: 'Dashboard', href: '/dashboard', permission: 'dashboard.view', icon: Icons.dashboard },
    { name: 'Meine Zuweisungen', href: '/my-assignments', permission: 'dashboard.view', icon: Icons.myAssignments },
    { name: 'Vertrieb', isHeader: true, permission: 'vertrieb' },
    { name: 'Kunden (CRM)', href: '/customers', permission: 'crm.view', icon: Icons.customers },
    { name: 'Leads', href: '/leads', permission: 'leads.view', icon: Icons.leads },
    { name: 'Angebote', href: '/quotes', permission: 'quotes.view', icon: Icons.quotes },
    { name: 'Rechnungen', href: '/invoices', permission: 'invoices.view', icon: Icons.invoices },
    { name: 'Finanzen', href: '/finances', permission: 'finances.view', icon: Icons.finances },
    { name: 'Spesen', href: '/expenses', permission: 'expenses.view', icon: Icons.expenses },
    { name: 'Verträge', href: '/contracts', permission: 'contracts.view', icon: Icons.contracts },
    { name: 'Projekte', isHeader: true, permission: 'projekte' },
    { name: 'Alle Projekte', href: '/projects', permission: 'projects.view', icon: Icons.projects },
    { name: 'Aufgaben', href: '/tasks', permission: 'tasks.view', icon: Icons.tasks },
    { name: 'Zeiterfassung', href: '/time-tracking', permission: 'time_tracking.view', icon: Icons.timeTracking },
    { name: 'Stundenauswertung', href: '/hours-report', permission: 'time_tracking.view', icon: Icons.hoursReport },
    { name: 'Kalender & Zeit', isHeader: true, permission: 'kalender' },
    { name: 'Kalender', href: '/calendar', permission: 'calendar.view', icon: Icons.calendar },
    { name: 'Urlaub', href: '/vacation', permission: 'leave.view', icon: Icons.vacation },
    { name: 'Kommunikation', isHeader: true, permission: 'kommunikation' },
    { name: 'Notizen', href: '/notes', permission: 'notes.view', icon: Icons.notes },
    { name: 'Tickets', href: '/tickets', permission: 'tickets.view', icon: Icons.tickets },
    { name: 'E-Mail', href: '/email', permission: 'email.view', icon: Icons.email },
    { name: 'Lager & Inventar', isHeader: true, permission: 'lager' },
    { name: 'Produktkatalog', href: '/products', permission: 'products.view', icon: Icons.products },
    { name: 'Inventar', href: '/inventory', permission: 'inventory.view', icon: Icons.inventory },
    { name: 'Warenwirtschaft', href: '/warehouse', permission: 'wms.view', icon: Icons.warehouse },
    { name: 'Tools', isHeader: true, permission: 'tools' },
    { name: 'Barcode', href: '/barcode', permission: 'barcode.view', icon: Icons.barcode },
    { name: 'Statistiken', href: '/statistics', permission: 'statistics.view', icon: Icons.statistics },
    { name: 'Wissensdatenbank', href: '/knowledge-base', permission: 'kb.view', icon: Icons.kb },
    { name: 'Team', isHeader: true, permission: 'team' },
    { name: 'Mitarbeiter', href: '/team', permission: 'team.view', icon: Icons.team },
    { name: 'System', isHeader: true, permission: 'system' },
    { name: 'Einstellungen', href: '/settings', permission: 'settings.view', icon: Icons.settings },
    { name: 'Benutzer', href: '/users', permission: 'users.view', icon: Icons.users },
    { name: 'Rollen & Rechte', href: '/roles', permission: 'roles.view', icon: Icons.roles },
    { name: 'Labels', href: '/labels', permission: 'labels.view', icon: Icons.labels },
    { name: 'Audit Logs', href: '/audit-logs', permission: 'audit_logs.view', icon: Icons.auditLogs },
    { name: 'Integrationen', href: '/integrations', permission: 'integrations.view', icon: Icons.integrations },
    { name: 'Datenbank', href: '/database', permission: 'database.access', icon: Icons.database },
];

// Generate color palette shades from a hex color
function hexToHSL(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function generatePalette(hex) {
    const { h, s } = hexToHSL(hex);
    return {
        50: `hsl(${h}, ${Math.min(s + 20, 100)}%, 97%)`,
        100: `hsl(${h}, ${Math.min(s + 15, 100)}%, 93%)`,
        200: `hsl(${h}, ${Math.min(s + 10, 100)}%, 85%)`,
        300: `hsl(${h}, ${s}%, 72%)`,
        400: `hsl(${h}, ${s}%, 58%)`,
        500: `hsl(${h}, ${s}%, 48%)`,
        600: `hsl(${h}, ${s}%, 40%)`,
        700: `hsl(${h}, ${Math.max(s - 5, 0)}%, 33%)`,
        800: `hsl(${h}, ${Math.max(s - 10, 0)}%, 26%)`,
        900: `hsl(${h}, ${Math.max(s - 15, 0)}%, 20%)`,
    };
}

export default function DashboardLayout({ children, title }) {
    const { auth, url = '', notifications: notificationsData = [], unreadNotificationsCount = 0, branding = {}, alerts = null } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [alertsOpen, setAlertsOpen] = useState(null); // 'tasks' | 'projects' | 'inventory' | null
    const alertsRef = useRef(null);

    // Dark mode
    const [darkMode, setDarkMode] = useState(() => {
        try {
            const saved = localStorage.getItem('theme');
            if (saved) return saved === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch { return false; }
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // Apply dynamic branding CSS custom properties
    useEffect(() => {
        if (branding?.primary_color && branding.primary_color !== '#0284c7') {
            const palette = generatePalette(branding.primary_color);
            const root = document.documentElement;
            Object.entries(palette).forEach(([shade, color]) => {
                root.style.setProperty(`--color-primary-${shade}`, color);
            });
        }
    }, [branding?.primary_color]);

    // Collapsible sidebar groups
    const [collapsedGroups, setCollapsedGroups] = useState(() => {
        try {
            const saved = localStorage.getItem('sidebar_collapsed');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });

    const toggleGroup = (groupName) => {
        setCollapsedGroups(prev => {
            const next = { ...prev, [groupName]: !prev[groupName] };
            localStorage.setItem('sidebar_collapsed', JSON.stringify(next));
            return next;
        });
    };

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchRef = useRef(null);
    const searchTimeout = useRef(null);

    const { post: logout } = useForm();

    const handleLogout = (e) => {
        e.preventDefault();
        logout(route('logout'));
    };

    // Debounced search
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            setSearchOpen(false);
            return;
        }

        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        setSearchLoading(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await axios.get('/search', { params: { q: searchQuery } });
                setSearchResults(res.data);
                setSearchOpen(true);
            } catch {
                // ignore
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [searchQuery]);

    const handleMarkAllRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            setNotificationsOpen(false);
            router.reload();
        } catch { /* ignore */ }
    };

    // Close dropdowns when clicking outside
    const notificationsRef = useRef(null);
    const userMenuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setNotificationsOpen(false);
            if (alertsRef.current && !alertsRef.current.contains(event.target)) setAlertsOpen(null);
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setUserMenuOpen(false);
            if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle search keyboard
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
    };

    const permissions = auth?.permissions || {};
    const userRole = auth?.user?.role || 'employee';

    const filteredNavigation = navigation.filter(item => {
        if (item.isHeader) return true;
        if (!item.permission) return true;
        if (item.name === 'Vertrieb' && !permissions['crm.view'] && !permissions['leads.view'] && !permissions['invoices.view'] && !permissions['quotes.view'] && !permissions['finances.view']) return false;
        if (item.name === 'Projekte' && !permissions['projects.view'] && !permissions['tasks.view'] && !permissions['time_tracking.view']) return false;
        if (item.name === 'Kalender & Zeit' && !permissions['calendar.view'] && !permissions['leave.view']) return false;
        if (item.name === 'Kommunikation' && !permissions['notes.view'] && !permissions['tickets.view'] && !permissions['email.view']) return false;
        if (item.name === 'Lager & Inventar' && !permissions['inventory.view'] && !permissions['wms.view']) return false;
        if (item.name === 'Tools' && !permissions['barcode.view'] && !permissions['statistics.view']) return false;
        if (item.name === 'Team' && !permissions['team.view']) return false;
        if (item.name === 'System' && userRole !== 'owner' && userRole !== 'admin' && !permissions['settings.view'] && !permissions['users.view'] && !permissions['roles.view'] && !permissions['labels.view'] && !permissions['audit_logs.view'] && !permissions['integrations.view'] && !permissions['database.access']) return false;
        if (item.permission && !permissions[item.permission] && userRole !== 'owner' && userRole !== 'admin') return false;
        return true;
    });

    const groupedNavigation = [];
    let currentGroup = [];
    filteredNavigation.forEach(item => {
        if (item.isHeader) {
            if (currentGroup.length > 0) groupedNavigation.push(currentGroup);
            currentGroup = [item];
        } else {
            currentGroup.push(item);
        }
    });
    if (currentGroup.length > 0) groupedNavigation.push(currentGroup);

    // Group search results by type
    const groupedResults = searchResults.reduce((acc, r) => {
        if (!acc[r.type]) acc[r.type] = [];
        acc[r.type].push(r);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        {branding?.app_logo ? (
                            <img src={`/storage/${branding.app_logo}`} alt={branding.app_name || 'Dashboard'} className="h-10 w-10 rounded-lg object-contain" />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                                <span className="text-xl font-bold text-white">{(branding?.app_name || 'D').charAt(0)}</span>
                            </div>
                        )}
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{branding?.app_name || 'Dashboard'}</span>
                    </Link>
                    <button className="lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={() => setSidebarOpen(false)}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <ul className="space-y-1">
                        {groupedNavigation.map((group, groupIndex) => {
                            const header = group.find(item => item.isHeader);
                            const links = group.filter(item => !item.isHeader && item.href);
                            const groupHasActive = links.some(item => url && url.startsWith(item.href));
                            const isCollapsed = header ? (collapsedGroups[header.name] && !groupHasActive) : false;

                            return (
                                <li key={groupIndex}>
                                    {header ? (
                                        <button
                                            onClick={() => toggleGroup(header.name)}
                                            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-md uppercase tracking-wider mt-3 first:mt-0 mx-0 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors cursor-pointer select-none"
                                        >
                                            <span>{header.name}</span>
                                            <svg
                                                className={`w-3.5 h-3.5 text-primary-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    ) : null}
                                    <div
                                        className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}
                                    >
                                        {links.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                                                    url && url.startsWith(item.href)
                                                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                                                }`}
                                            >
                                                <span className={url && url.startsWith(item.href) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}>
                                                    {item.icon}
                                                </span>
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
                {/* Top header */}
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex flex-1 items-center">
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title || 'Dashboard'}</h1>
                        </div>

                        <div className="flex items-center gap-x-2 lg:gap-x-4">
                            {/* Global Search */}
                            <div className="hidden md:block relative" ref={searchRef}>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        {searchLoading ? (
                                            <svg className="h-4 w-4 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        ) : (
                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Suchen..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                        onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                                        className="block w-56 lg:w-64 pl-10 pr-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                                {/* Search Results Dropdown */}
                                {searchOpen && searchResults.length > 0 && (
                                    <div className="absolute right-0 mt-1 w-96 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 max-h-96 overflow-y-auto">
                                        {Object.entries(groupedResults).map(([type, items]) => (
                                            <div key={type}>
                                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">{type}</div>
                                                {items.map((item) => (
                                                    <a
                                                        key={`${item.type}-${item.id}`}
                                                        href={item.url}
                                                        className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                                                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                                                    >
                                                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                                        {item.subtitle && <p className="text-xs text-gray-500">{item.subtitle}</p>}
                                                    </a>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {searchOpen && searchQuery.length >= 2 && searchResults.length === 0 && (
                                    <div className="absolute right-0 mt-1 w-96 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50">
                                        <p className="text-sm text-gray-500">Keine Ergebnisse gefunden</p>
                                    </div>
                                )}
                            </div>

                            {/* Alert Icons */}
                            {alerts && (() => {
                                const taskCount = (alerts.overdue_tasks?.length || 0) + (alerts.urgent_tasks?.length || 0);
                                const projectCount = (alerts.overdue_projects?.length || 0) + (alerts.urgent_projects?.length || 0);
                                const stockCount = alerts.low_stock?.length || 0;
                                const AlertBtn = ({ type, count, icon, title, children }) => {
                                    const isOverdue = type === 'tasks' ? alerts.overdue_tasks?.length > 0 : type === 'projects' ? alerts.overdue_projects?.length > 0 : alerts.low_stock?.some(i => i.current_stock === 0);
                                    const hasAlerts = count > 0;
                                    return (
                                        <div className="relative">
                                            <button
                                                onClick={() => hasAlerts && setAlertsOpen(alertsOpen === type ? null : type)}
                                                className={`relative p-2 rounded-lg transition-colors ${hasAlerts ? (isOverdue ? 'text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer' : 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 cursor-pointer') : 'text-gray-400 cursor-default'}`}
                                                title={title}
                                            >
                                                {icon}
                                                {hasAlerts && <span className={`absolute top-0 right-0 h-4 w-4 rounded-full ring-2 ring-white text-[10px] text-white flex items-center justify-center font-medium ${isOverdue ? 'bg-red-500' : 'bg-amber-500'}`}>
                                                    {count > 9 ? '9+' : count}
                                                </span>}
                                            </button>
                                            {alertsOpen === type && (
                                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                                                    <div className={`px-4 py-2.5 border-b border-gray-100 flex items-center justify-between ${isOverdue ? 'bg-red-50' : 'bg-amber-50'}`}>
                                                        <span className={`text-sm font-semibold ${isOverdue ? 'text-red-800' : 'text-amber-800'}`}>{title} ({count})</span>
                                                        <button onClick={() => setAlertsOpen(null)} className="text-gray-400 hover:text-gray-600">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">{children}</div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                };
                                const Row = ({ item, color }) => (
                                    <a href={item.url} onClick={() => setAlertsOpen(null)} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors">
                                        <span className="text-sm text-gray-800 truncate flex-1">{item.title}</span>
                                        <span className={`text-xs font-medium ml-2 flex-shrink-0 ${color}`}>
                                            {item.due_date ? new Date(item.due_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : `${item.current_stock} ${item.unit}`}
                                        </span>
                                    </a>
                                );
                                const SectionHead = ({ label, count, color }) => (
                                    <div className="px-4 py-1.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                                        <span>{label}</span>
                                        <span className={`px-1.5 py-0.5 rounded font-bold ${color}`}>{count}</span>
                                    </div>
                                );
                                return (
                                    <div className="flex items-center gap-1" ref={alertsRef}>
                                        <AlertBtn type="tasks" count={taskCount} title="Aufgaben" icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}>
                                            {alerts.overdue_tasks?.length > 0 && <><SectionHead label="Überfällig" count={alerts.overdue_tasks.length} color="bg-red-100 text-red-600" />{alerts.overdue_tasks.map(t => <Row key={t.id} item={t} color="text-red-600" />)}</>}
                                            {alerts.urgent_tasks?.length > 0 && <><SectionHead label="Fällig in 48h" count={alerts.urgent_tasks.length} color="bg-orange-100 text-orange-600" />{alerts.urgent_tasks.map(t => <Row key={t.id} item={t} color="text-orange-600" />)}</>}
                                        </AlertBtn>
                                        <AlertBtn type="projects" count={projectCount} title="Projekte" icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}>
                                            {alerts.overdue_projects?.length > 0 && <><SectionHead label="Überfällig" count={alerts.overdue_projects.length} color="bg-red-100 text-red-600" />{alerts.overdue_projects.map(p => <Row key={p.id} item={p} color="text-red-600" />)}</>}
                                            {alerts.urgent_projects?.length > 0 && <><SectionHead label="Fällig in 48h" count={alerts.urgent_projects.length} color="bg-orange-100 text-orange-600" />{alerts.urgent_projects.map(p => <Row key={p.id} item={p} color="text-orange-600" />)}</>}
                                        </AlertBtn>
                                        <AlertBtn type="inventory" count={stockCount} title="Lagerbestand" icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}>
                                            {alerts.low_stock?.length > 0 && <><SectionHead label="Kritischer Bestand" count={alerts.low_stock.length} color="bg-orange-100 text-orange-600" />{alerts.low_stock.map(i => <Row key={i.id} item={i} color={i.current_stock === 0 ? 'text-red-600' : 'text-orange-600'} />)}</>}
                                        </AlertBtn>
                                    </div>
                                );
                            })()}

                            {/* Dark Mode Toggle */}
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="relative -m-2.5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title={darkMode ? 'Light Mode' : 'Dark Mode'}
                            >
                                {darkMode ? (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <div className="relative" ref={notificationsRef}>
                                <button
                                    type="button"
                                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                                    className="relative -m-2.5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {unreadNotificationsCount > 0 && (
                                        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 ring-2 ring-white text-[10px] text-white flex items-center justify-center font-medium">
                                            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                                        </span>
                                    )}
                                </button>

                                {notificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Benachrichtigungen</h3>
                                            {unreadNotificationsCount > 0 && (
                                                <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:text-primary-700">
                                                    Alle gelesen
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notificationsData.length === 0 ? (
                                                <div className="px-4 py-6 text-center text-sm text-gray-500">Keine neuen Benachrichtigungen</div>
                                            ) : (
                                                notificationsData.map((notification) => (
                                                    <a
                                                        key={notification.id}
                                                        href={notification.link || '#'}
                                                        className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-primary-50/50' : ''}`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`flex-shrink-0 h-2 w-2 rounded-full mt-2 ${notification.read ? 'bg-gray-300' : 'bg-primary-500'}`}></div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                                                <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                                                                <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.created_at)}</p>
                                                            </div>
                                                        </div>
                                                    </a>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

                            {/* User Dropdown */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <UserAvatar user={auth.user} size="md" className="ring-2 ring-gray-100" />
                                    <div className="hidden lg:block text-left">
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block">{auth.user.name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{auth.user.role || 'Employee'}</span>
                                    </div>
                                    <svg className="hidden lg:block h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{auth.user.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{auth.user.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                Profil
                                            </Link>
                                            <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                Einstellungen
                                            </Link>
                                        </div>
                                        <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                                            <form onSubmit={handleLogout} method="POST" action="/logout">
                                                <button type="submit" className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                    Abmelden
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>

            {/* Chat Button */}
            <ChatButton />

            {/* Toast */}
            <Toast />
        </div>
    );
}
