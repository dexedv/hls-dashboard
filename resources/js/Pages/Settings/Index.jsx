import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import axios from 'axios';

const allTabs = [
    { id: 'general', label: 'Allgemein', adminOnly: true, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'company', label: 'Firmendaten', adminOnly: true, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'branding', label: 'Erscheinungsbild', adminOnly: true, icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { id: 'email', label: 'E-Mail', adminOnly: true, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'license', label: 'Lizenz', adminOnly: true, icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
    { id: 'security', label: 'Sicherheit', adminOnly: false, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'logs', label: 'Logs', adminOnly: true, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'system', label: 'System', adminOnly: true, icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' },
];

export default function SettingsIndex({ settings, emailSettings, licenseInfo, userCount, twoFactorEnabled, isAdmin }) {
    const tabs = allTabs.filter(tab => !tab.adminOnly || isAdmin);
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'security');

    return (
        <DashboardLayout title="Einstellungen">
            <Head title="Einstellungen" />
            <PageHeader title="Einstellungen" subtitle="Systemeinstellungen und Konfiguration" />

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-56 flex-shrink-0">
                    <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-l-2 border-primary-600'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-2 border-transparent'
                                }`}
                            >
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                                </svg>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 min-w-0">
                    {activeTab === 'general' && <GeneralTab settings={settings} />}
                    {activeTab === 'company' && <CompanyTab settings={settings} />}
                    {activeTab === 'branding' && <BrandingTab settings={settings} />}
                    {activeTab === 'email' && <EmailTab emailSettings={emailSettings} />}
                    {activeTab === 'license' && <LicenseTab licenseInfo={licenseInfo} userCount={userCount} />}
                    {activeTab === 'security' && <SecurityTab twoFactorEnabled={twoFactorEnabled} />}
                    {activeTab === 'logs' && <LogsTab />}
                    {activeTab === 'system' && <SystemTab />}
                </div>
            </div>
        </DashboardLayout>
    );
}

function Card({ title, description, children }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            {title && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                    {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
                </div>
            )}
            {children}
        </div>
    );
}

function SaveButton({ saving, onClick, label = 'Speichern' }) {
    return (
        <button
            onClick={onClick}
            disabled={saving}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
            {saving ? 'Speichern...' : label}
        </button>
    );
}

function InputField({ label, required, ...props }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input {...props} className={`w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${props.className || ''}`} />
        </div>
    );
}

function GeneralTab({ settings }) {
    const [taxRate, setTaxRate] = useState(settings.tax_rate ?? 19);
    const [currency, setCurrency] = useState(settings.currency ?? 'EUR');
    const [saving, setSaving] = useState(false);

    const save = () => {
        setSaving(true);
        router.post(route('settings.saveGeneral'), { tax_rate: taxRate, currency }, { onFinish: () => setSaving(false) });
    };

    return (
        <Card title="Allgemeine Einstellungen" description="Steuersatz und Waehrung fuer Rechnungen und Angebote">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Steuersatz (%)" type="number" step="0.1" min="0" max="100" value={taxRate} onChange={e => setTaxRate(e.target.value)} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Waehrung</label>
                        <select value={currency} onChange={e => setCurrency(e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            <option value="EUR">EUR - Euro</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="GBP">GBP - Britisches Pfund</option>
                            <option value="CHF">CHF - Schweizer Franken</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end"><SaveButton saving={saving} onClick={save} /></div>
            </div>
        </Card>
    );
}

function CompanyTab({ settings }) {
    const [form, setForm] = useState({
        company_name: settings.company_name || '', company_address: settings.company_address || '',
        company_zip: settings.company_zip || '', company_city: settings.company_city || '',
        company_country: settings.company_country || 'Deutschland', company_phone: settings.company_phone || '',
        company_email: settings.company_email || '', company_website: settings.company_website || '',
        company_tax_id: settings.company_tax_id || '', company_vat_id: settings.company_vat_id || '',
    });
    const [saving, setSaving] = useState(false);
    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
    const save = () => { setSaving(true); router.post(route('settings.saveCompany'), form, { onFinish: () => setSaving(false) }); };

    return (
        <Card title="Firmendaten" description="Werden fuer Rechnungen, Angebote und PDF-Dokumente verwendet">
            <div className="space-y-4">
                <InputField label="Firmenname" required type="text" value={form.company_name} onChange={e => update('company_name', e.target.value)} />
                <InputField label="Strasse" type="text" value={form.company_address} onChange={e => update('company_address', e.target.value)} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="PLZ" type="text" value={form.company_zip} onChange={e => update('company_zip', e.target.value)} />
                    <InputField label="Ort" type="text" value={form.company_city} onChange={e => update('company_city', e.target.value)} />
                    <InputField label="Land" type="text" value={form.company_country} onChange={e => update('company_country', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Telefon" type="text" value={form.company_phone} onChange={e => update('company_phone', e.target.value)} />
                    <InputField label="E-Mail" type="email" value={form.company_email} onChange={e => update('company_email', e.target.value)} />
                </div>
                <InputField label="Website" type="url" value={form.company_website} onChange={e => update('company_website', e.target.value)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Steuer-ID" type="text" value={form.company_tax_id} onChange={e => update('company_tax_id', e.target.value)} />
                    <InputField label="USt-IdNr." type="text" value={form.company_vat_id} onChange={e => update('company_vat_id', e.target.value)} />
                </div>
                <div className="flex justify-end"><SaveButton saving={saving} onClick={save} /></div>
            </div>
        </Card>
    );
}

function BrandingTab({ settings }) {
    const [appName, setAppName] = useState(settings.app_name || 'Dashboard');
    const [primaryColor, setPrimaryColor] = useState(settings.primary_color || '#0284c7');
    const [saving, setSaving] = useState(false);
    const logoRef = useRef(null);
    const faviconRef = useRef(null);

    const save = () => {
        setSaving(true);
        const formData = new FormData();
        formData.append('app_name', appName);
        formData.append('primary_color', primaryColor);
        if (logoRef.current?.files[0]) formData.append('app_logo', logoRef.current.files[0]);
        if (faviconRef.current?.files[0]) formData.append('app_favicon', faviconRef.current.files[0]);
        router.post(route('settings.saveBranding'), formData, { onFinish: () => setSaving(false), forceFormData: true });
    };

    return (
        <Card title="Erscheinungsbild" description="Logo, Name und Farben Ihres Dashboards anpassen">
            <div className="space-y-4">
                <InputField label="App-Name" type="text" value={appName} onChange={e => setAppName(e.target.value)} />
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primaerfarbe</label>
                    <div className="flex items-center gap-3">
                        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 w-14 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer" />
                        <input type="text" value={primaryColor} readOnly className="w-32 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo</label>
                        {settings.app_logo && <div className="mb-2"><img src={`/storage/${settings.app_logo}`} alt="Logo" className="h-12 object-contain" /></div>}
                        <input type="file" ref={logoRef} accept="image/png,image/jpeg,image/svg+xml" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm dark:text-gray-300" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG oder SVG. Max. 2MB.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Favicon</label>
                        <input type="file" ref={faviconRef} accept="image/png,image/x-icon,image/svg+xml" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm dark:text-gray-300" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, ICO oder SVG. Max. 1MB.</p>
                    </div>
                </div>
                <div className="flex justify-end"><SaveButton saving={saving} onClick={save} /></div>
            </div>
        </Card>
    );
}

function EmailTab({ emailSettings }) {
    const [form, setForm] = useState({
        mail_host: emailSettings?.mail_host || '',
        mail_port: emailSettings?.mail_port || '587',
        mail_username: emailSettings?.mail_username || '',
        mail_password: emailSettings?.mail_password || '',
        mail_encryption: emailSettings?.mail_encryption || 'tls',
        mail_from_address: emailSettings?.mail_from_address || '',
        mail_from_name: emailSettings?.mail_from_name || '',
    });
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const save = () => {
        setSaving(true);
        router.post(route('settings.saveEmail'), form, { onFinish: () => setSaving(false) });
    };

    const testEmail = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const res = await axios.post(route('settings.testEmail'));
            setTestResult({ success: true, message: res.data.message });
        } catch (err) {
            setTestResult({ success: false, message: err.response?.data?.error || 'Fehler beim Senden.' });
        }
        setTesting(false);
    };

    return (
        <Card title="E-Mail-Konfiguration" description="SMTP-Einstellungen fuer den E-Mail-Versand">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="SMTP-Host" required type="text" placeholder="smtp.example.com" value={form.mail_host} onChange={e => update('mail_host', e.target.value)} />
                    <InputField label="Port" required type="number" placeholder="587" value={form.mail_port} onChange={e => update('mail_port', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Benutzername" type="text" value={form.mail_username} onChange={e => update('mail_username', e.target.value)} />
                    <InputField label="Passwort" type="password" value={form.mail_password} onChange={e => update('mail_password', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verschluesselung <span className="text-red-500">*</span></label>
                    <select value={form.mail_encryption} onChange={e => update('mail_encryption', e.target.value)}
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                        <option value="none">Keine</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Absender-Adresse" required type="email" placeholder="noreply@example.com" value={form.mail_from_address} onChange={e => update('mail_from_address', e.target.value)} />
                    <InputField label="Absender-Name" required type="text" placeholder="Mein Dashboard" value={form.mail_from_name} onChange={e => update('mail_from_name', e.target.value)} />
                </div>

                {testResult && (
                    <div className={`p-3 rounded-lg text-sm ${testResult.success ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                        {testResult.message}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button onClick={testEmail} disabled={testing || !form.mail_host}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                        {testing ? 'Sende...' : 'Test-E-Mail senden'}
                    </button>
                    <SaveButton saving={saving} onClick={save} label="Einstellungen speichern" />
                </div>
            </div>
        </Card>
    );
}

function LicenseTab({ licenseInfo, userCount }) {
    const [licenseKey, setLicenseKey] = useState('');
    const [activating, setActivating] = useState(false);
    const activate = () => {
        setActivating(true);
        router.post(route('settings.activateLicense'), { license_key: licenseKey }, { onFinish: () => { setActivating(false); setLicenseKey(''); } });
    };
    const planLabels = { starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise' };
    const planColors = { starter: 'bg-gray-100 text-gray-700', professional: 'bg-blue-100 text-blue-700', enterprise: 'bg-purple-100 text-purple-700' };

    return (
        <div className="space-y-6">
            {licenseInfo ? (
                <Card title="Aktive Lizenz">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Plan</span>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${planColors[licenseInfo.plan] || 'bg-gray-100 text-gray-700'}`}>
                                        {planLabels[licenseInfo.plan] || licenseInfo.plan}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Lizenziert fuer</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{licenseInfo.licensed_to}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Benutzer</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{userCount} / {licenseInfo.max_users}</p>
                                <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${userCount >= licenseInfo.max_users ? 'bg-red-500' : 'bg-primary-600'}`}
                                        style={{ width: `${Math.min((userCount / licenseInfo.max_users) * 100, 100)}%` }} />
                                </div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Gueltig bis</span>
                                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {licenseInfo.valid_until || 'Unbegrenzt (Lifetime)'}
                                    {licenseInfo.is_expired && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">Abgelaufen</span>}
                                </p>
                            </div>
                        </div>
                        {licenseInfo.license_key_masked && (
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Lizenzschluessel</span>
                                <p className="mt-1 text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 break-all">{licenseInfo.license_key_masked}</p>
                            </div>
                        )}
                    </div>
                </Card>
            ) : (
                <Card title="Keine Lizenz">
                    <div className="text-center py-4">
                        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Keine aktive Lizenz gefunden.</p>
                    </div>
                </Card>
            )}
            <Card title="Lizenz aktivieren" description="Geben Sie einen neuen Lizenzschluessel ein">
                <div className="space-y-3">
                    <textarea value={licenseKey} onChange={e => setLicenseKey(e.target.value)} rows={3} placeholder="Lizenzschluessel hier einfuegen..."
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
                    <div className="flex justify-end">
                        <button onClick={activate} disabled={activating || !licenseKey.trim()}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                            {activating ? 'Aktiviere...' : 'Lizenz aktivieren'}
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

function SecurityTab({ twoFactorEnabled }) {
    const [is2faEnabled, setIs2faEnabled] = useState(twoFactorEnabled);
    const [showSetup, setShowSetup] = useState(false);
    const [qrUrl, setQrUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [code, setCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');
    const [message, setMessage] = useState('');

    const enable2fa = async () => {
        setLoading(true);
        try { const res = await axios.post(route('two-factor.enable')); setQrUrl(res.data.qr_url); setSecret(res.data.secret); setShowSetup(true); }
        catch { setMessage('Fehler beim Aktivieren von 2FA.'); }
        setLoading(false);
    };
    const confirm2fa = async () => {
        setLoading(true);
        try {
            const res = await axios.post(route('two-factor.confirm'), { code });
            if (res.data.success) { setIs2faEnabled(true); setRecoveryCodes(res.data.recovery_codes); setShowSetup(false); setMessage('2FA erfolgreich aktiviert!'); }
            else { setMessage(res.data.message); }
        } catch (err) { setMessage(err.response?.data?.message || 'Ungültiger Code.'); }
        setLoading(false);
    };
    const disable2fa = async () => {
        setLoading(true);
        try {
            const res = await axios.post(route('two-factor.disable'), { password: disablePassword });
            if (res.data.success) { setIs2faEnabled(false); setDisablePassword(''); setMessage('2FA deaktiviert.'); }
            else { setMessage(res.data.message); }
        } catch (err) { setMessage(err.response?.data?.message || 'Fehler beim Deaktivieren.'); }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <Card title="Zwei-Faktor-Authentifizierung (2FA)" description="Schuetzen Sie Ihren Account mit einem zusaetzlichen Sicherheitsfaktor">
                {message && <div className="mb-4 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm">{message}</div>}
                {is2faEnabled && !showSetup ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">2FA ist aktiviert</span>
                        </div>
                        {recoveryCodes.length > 0 && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Wiederherstellungscodes - Sicher aufbewahren!</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {recoveryCodes.map((code, i) => (<code key={i} className="text-sm bg-white dark:bg-gray-700 px-2 py-1 rounded border dark:border-gray-600 text-center">{code}</code>))}
                                </div>
                            </div>
                        )}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">2FA deaktivieren (Passwort erforderlich)</p>
                            <div className="flex gap-2">
                                <input type="password" value={disablePassword} onChange={e => setDisablePassword(e.target.value)} placeholder="Passwort"
                                    className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                                <button onClick={disable2fa} disabled={loading || !disablePassword}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">Deaktivieren</button>
                            </div>
                        </div>
                    </div>
                ) : showSetup ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Scannen Sie den QR-Code mit Ihrer Authenticator-App.</p>
                        <div className="flex justify-center p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`} alt="2FA QR Code" className="w-48 h-48" />
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Manueller Schluessel:</p>
                            <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">{secret}</code>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bestaetigungscode</label>
                            <div className="flex gap-2">
                                <input type="text" value={code} onChange={e => setCode(e.target.value)} maxLength={6} placeholder="6-stelliger Code"
                                    className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm text-center tracking-widest font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                                <button onClick={confirm2fa} disabled={loading || code.length !== 6}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">Bestätigen</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">2FA ist nicht aktiviert.</p>
                        <button onClick={enable2fa} disabled={loading}
                            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">2FA aktivieren</button>
                    </div>
                )}
            </Card>
        </div>
    );
}

function LogsTab() {
    const [logs, setLogs] = useState([]);
    const [dates, setDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);

    const fetchLogs = async (p = 1) => {
        setLoading(true);
        try {
            const params = { page: p };
            if (selectedDate) params.date = selectedDate;
            if (levelFilter) params.level = levelFilter;
            const res = await axios.get(route('settings.logs'), { params });
            setLogs(res.data.entries);
            setTotal(res.data.total);
            setDates(res.data.dates);
            setPage(p);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchLogs(); }, [selectedDate, levelFilter]);

    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => fetchLogs(page), 10000);
        return () => clearInterval(interval);
    }, [autoRefresh, page, selectedDate, levelFilter]);

    const clearLogs = async () => {
        try {
            await axios.post(route('settings.clearLogs'), { date: selectedDate });
            fetchLogs();
        } catch { /* ignore */ }
    };

    const levelColors = {
        error: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        debug: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };

    return (
        <Card title="System-Logs" description="Anwendungsprotokolle anzeigen und verwalten">
            <div className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center">
                    <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Heute</option>
                        {dates.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Alle Level</option>
                        <option value="error">Error</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
                        Auto-Refresh
                    </label>
                    <div className="flex-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{total} Einträge</span>
                    <button onClick={clearLogs} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors">
                        Logs leeren
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-600">
                                <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium w-44">Zeitstempel</th>
                                <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium w-24">Level</th>
                                <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Nachricht</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={3} className="py-8 text-center text-gray-400">Laden...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={3} className="py-8 text-center text-gray-400 dark:text-gray-500">Keine Log-Einträge gefunden.</td></tr>
                            ) : logs.map((log, i) => (
                                <tr key={i} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="py-2 px-3 text-xs text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">{log.timestamp}</td>
                                    <td className="py-2 px-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${levelColors[log.level] || levelColors.debug}`}>
                                            {log.level}
                                        </span>
                                    </td>
                                    <td className="py-2 px-3 text-gray-700 dark:text-gray-300 text-xs font-mono break-all max-w-md truncate">{log.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {total > 50 && (
                    <div className="flex justify-center gap-2">
                        <button onClick={() => fetchLogs(page - 1)} disabled={page <= 1}
                            className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-300">Zurück</button>
                        <span className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400">Seite {page} / {Math.ceil(total / 50)}</span>
                        <button onClick={() => fetchLogs(page + 1)} disabled={page >= Math.ceil(total / 50)}
                            className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-300">Weiter</button>
                    </div>
                )}
            </div>
        </Card>
    );
}

function SystemTab() {
    const { app_version } = usePage().props;
    const [cacheStatus, setCacheStatus] = useState('');
    const [dbStatus, setDbStatus] = useState('');
    const [backupStatus, setBackupStatus] = useState('');
    const [loading, setLoading] = useState({});
    const [health, setHealth] = useState(null);
    const [backups, setBackups] = useState([]);
    const [updateInfo, setUpdateInfo] = useState(null);
    const [tempPassword, setTempPassword] = useState(null);

    const clearCache = async () => {
        setLoading(prev => ({ ...prev, cache: true }));
        try { const res = await axios.post(route('database.clearCache')); setCacheStatus(res.data.message); }
        catch (err) { setCacheStatus(err.response?.data?.error || 'Fehler'); }
        setLoading(prev => ({ ...prev, cache: false }));
    };
    const optimizeDb = async () => {
        setLoading(prev => ({ ...prev, db: true }));
        try { const res = await axios.post(route('database.optimize')); setDbStatus(res.data.message); }
        catch (err) { setDbStatus(err.response?.data?.error || 'Fehler'); }
        setLoading(prev => ({ ...prev, db: false }));
    };
    const createBackup = async () => {
        setLoading(prev => ({ ...prev, backup: true }));
        try { const res = await axios.post(route('database.backup')); setBackupStatus(res.data.message); fetchBackups(); }
        catch (err) { setBackupStatus(err.response?.data?.error || 'Fehler'); }
        setLoading(prev => ({ ...prev, backup: false }));
    };

    const fetchHealth = async () => {
        try { const res = await axios.get(route('health.check')); setHealth(res.data); }
        catch { /* ignore */ }
    };
    const fetchBackups = async () => {
        try { const res = await axios.get(route('settings.listBackups')); setBackups(res.data); }
        catch { /* ignore */ }
    };
    const checkUpdate = async () => {
        setLoading(prev => ({ ...prev, update: true }));
        try { const res = await axios.get(route('settings.checkUpdate')); setUpdateInfo(res.data); }
        catch { /* ignore */ }
        setLoading(prev => ({ ...prev, update: false }));
    };
    const restoreBackup = async (filename) => {
        if (!confirm('Backup wirklich wiederherstellen? Dies überschreibt die aktuelle Datenbank!')) return;
        try { await axios.post(route('settings.restoreBackup'), { filename }); setBackupStatus('Backup wiederhergestellt.'); }
        catch (err) { setBackupStatus(err.response?.data?.error || 'Fehler'); }
    };
    const deleteBackup = async (filename) => {
        if (!confirm('Backup wirklich löschen?')) return;
        try { await axios.post(route('settings.deleteBackup'), { filename }); fetchBackups(); }
        catch { /* ignore */ }
    };

    useEffect(() => { fetchHealth(); fetchBackups(); }, []);

    const statusBadge = (status) => {
        const colors = { ok: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', error: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' };
        return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${colors[status] || colors.error}`}>{status}</span>;
    };

    return (
        <div className="space-y-6">
            {/* Health Dashboard */}
            <Card title="System-Status" description="Übersicht der Systemkomponenten">
                {health ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {Object.entries(health.checks).map(([key, check]) => (
                            <div key={key} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">{key}</p>
                                {statusBadge(check.status)}
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{check.message}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <button onClick={fetchHealth} className="text-sm text-primary-600 hover:text-primary-700">Status laden...</button>
                    </div>
                )}
            </Card>

            {/* Version & Update */}
            <Card title="Version & Updates">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Aktuelle Version: <span className="font-mono">{app_version || '1.0.0'}</span></p>
                        {updateInfo && (
                            <div className="mt-2">
                                {updateInfo.update_available ? (
                                    <p className="text-sm text-amber-600 dark:text-amber-400">Update verfügbar: <span className="font-mono">{updateInfo.latest}</span></p>
                                ) : updateInfo.error ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{updateInfo.error}</p>
                                ) : (
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400">System ist aktuell.</p>
                                )}
                            </div>
                        )}
                    </div>
                    <button onClick={checkUpdate} disabled={loading.update}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                        {loading.update ? 'Prüfe...' : 'Auf Updates prüfen'}
                    </button>
                </div>
            </Card>

            {/* Maintenance */}
            <Card title="Systemwartung" description="Cache, Datenbank und Backups verwalten">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Cache leeren</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Anwendungs-Cache zuruecksetzen</p>
                            {cacheStatus && <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">{cacheStatus}</p>}
                        </div>
                        <button onClick={clearCache} disabled={loading.cache}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                            {loading.cache ? '...' : 'Cache leeren'}
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Datenbank optimieren</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">VACUUM / OPTIMIZE fuer bessere Performance</p>
                            {dbStatus && <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">{dbStatus}</p>}
                        </div>
                        <button onClick={optimizeDb} disabled={loading.db}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                            {loading.db ? '...' : 'Optimieren'}
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Backup erstellen</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Datenbank-Backup erstellen und speichern</p>
                            {backupStatus && <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">{backupStatus}</p>}
                        </div>
                        <button onClick={createBackup} disabled={loading.backup}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                            {loading.backup ? '...' : 'Backup erstellen'}
                        </button>
                    </div>
                </div>
            </Card>

            {/* Backup List */}
            {backups.length > 0 && (
                <Card title="Vorhandene Backups">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                    <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Name</th>
                                    <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Größe</th>
                                    <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Datum</th>
                                    <th className="text-right py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {backups.map((backup) => (
                                    <tr key={backup.name} className="border-b border-gray-100 dark:border-gray-700">
                                        <td className="py-2 px-3 font-mono text-xs text-gray-700 dark:text-gray-300">{backup.name}</td>
                                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{backup.size}</td>
                                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{backup.date}</td>
                                        <td className="py-2 px-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <a href={route('settings.downloadBackup', backup.name)} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-500">Download</a>
                                                <button onClick={() => restoreBackup(backup.name)} className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded hover:bg-amber-200">Restore</button>
                                                <button onClick={() => deleteBackup(backup.name)} className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded hover:bg-red-200">Löschen</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
