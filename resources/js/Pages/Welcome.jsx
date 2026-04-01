import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="HLS Dashboard - Willkommen" />
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>

                <div className="relative flex min-h-screen flex-col">
                    {/* Header */}
                    <header className="w-full px-6 py-6">
                        <nav className="flex items-center justify-between max-w-7xl mx-auto">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                                    <span className="text-2xl font-bold text-white">H</span>
                                </div>
                                <span className="text-2xl font-bold text-white">HLS Dashboard</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/25"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="px-5 py-2.5 text-white font-medium rounded-lg hover:bg-white/10 transition-all"
                                        >
                                            Anmelden
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/25"
                                        >
                                            Registrieren
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </header>

                    {/* Hero Section */}
                    <main className="flex-1 flex items-center justify-center px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-cyan-400 text-sm font-medium mb-8">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                Professionelles Business Dashboard
                            </div>

                            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                                Alles was Sie brauchen
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                    an einem Ort
                                </span>
                            </h1>

                            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                                Verwalten Sie Ihre Kunden, Projekte, Finanzen und mehr
                                mit unserem umfassenden ERP-System.
                            </p>

                            {/* Feature Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                                {[
                                    { icon: '👥', title: 'CRM', desc: 'Kundenverwaltung' },
                                    { icon: '📁', title: 'Projekte', desc: 'Projektmanagement' },
                                    { icon: '💰', title: 'Finanzen', desc: 'Rechnungen & Finanzen' },
                                ].map((feature, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                        <div className="text-4xl mb-3">{feature.icon}</div>
                                        <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                                        <p className="text-slate-400 text-sm">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                {[
                                    { icon: '⏱️', title: 'Zeiterfassung', desc: 'Arbeitszeiten' },
                                    { icon: '📦', title: 'Inventar', desc: 'Lagerverwaltung' },
                                    { icon: '📈', title: 'Statistiken', desc: 'Auswertungen' },
                                ].map((feature, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                        <div className="text-4xl mb-3">{feature.icon}</div>
                                        <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                                        <p className="text-slate-400 text-sm">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="py-8 text-center text-slate-500 text-sm">
                        <p>&copy; {new Date().getFullYear()} HLS Dashboard. Alle Rechte vorbehalten.</p>
                    </footer>
                </div>
            </div>
        </>
    );
}
