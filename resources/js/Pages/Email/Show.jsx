import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';

export default function EmailShow() {
    const { email } = usePage().props;

    const handleDelete = () => {
        if (confirm('E-Mail wirklich löschen?')) {
            router.delete(route('email.destroy', email.id));
        }
    };

    const handleToggleStar = () => {
        router.post(route('email.toggleStar', email.id));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <DashboardLayout title={email.subject || '(Kein Betreff)'}>
            <Head title={email.subject || '(Kein Betreff)'} />

            <div className="max-w-3xl">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/email" className="text-sm text-gray-500 hover:text-gray-700">E-Mail</Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-sm text-gray-700 font-medium truncate max-w-xs">{email.subject || '(Kein Betreff)'}</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">{email.subject || '(Kein Betreff)'}</h1>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleToggleStar}
                            className={`p-2 rounded-lg border transition-colors ${email.is_starred ? 'bg-yellow-50 border-yellow-200 text-yellow-500' : 'border-gray-200 text-gray-400 hover:text-yellow-500'}`}
                            title={email.is_starred ? 'Stern entfernen' : 'Mit Stern markieren'}
                        >
                            <svg className="w-4 h-4" fill={email.is_starred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </button>
                        <Link href={route('email.reply', email.id)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            Antworten
                        </Link>
                        <button onClick={handleDelete} className="px-3 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                            Löschen
                        </button>
                    </div>
                </div>

                {/* Meta */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 p-4 space-y-2 text-sm">
                    <div className="flex gap-2">
                        <span className="font-medium text-gray-500 w-12 shrink-0">Von:</span>
                        <span className="text-gray-800">{email.from}</span>
                    </div>
                    {email.to && (
                        <div className="flex gap-2">
                            <span className="font-medium text-gray-500 w-12 shrink-0">An:</span>
                            <span className="text-gray-800">{Array.isArray(email.to) ? email.to.join(', ') : email.to}</span>
                        </div>
                    )}
                    {email.cc && (
                        <div className="flex gap-2">
                            <span className="font-medium text-gray-500 w-12 shrink-0">CC:</span>
                            <span className="text-gray-800">{Array.isArray(email.cc) ? email.cc.join(', ') : email.cc}</span>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <span className="font-medium text-gray-500 w-12 shrink-0">Zeit:</span>
                        <span className="text-gray-800">{formatDate(email.received_at)}</span>
                    </div>
                </div>

                {/* Body */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    {email.body_html ? (
                        <div
                            className="prose prose-sm max-w-none text-gray-800"
                            dangerouslySetInnerHTML={{ __html: email.body_html }}
                        />
                    ) : (
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                            {email.body_text || '(Kein Inhalt)'}
                        </pre>
                    )}
                </div>

                {/* Attachments */}
                {email.attachments && email.attachments.length > 0 && (
                    <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">Anhänge ({email.attachments.length})</p>
                        <div className="flex flex-wrap gap-2">
                            {email.attachments.map((att, i) => (
                                <a
                                    key={i}
                                    href={att.url || '#'}
                                    className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
                                    download
                                >
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    {att.filename || `Anhang ${i + 1}`}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
