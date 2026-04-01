import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';

function formatSize(bytes) {
    if (!bytes) return '—';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return Math.round(bytes / 1024) + ' KB';
    return bytes + ' B';
}

const isImage       = (m) => m?.startsWith('image/');
const isPdf         = (m) => m === 'application/pdf';
const isText        = (m) => m?.startsWith('text/');
const isPreviewable = (m) => isImage(m) || isPdf(m) || isText(m);

const previewUrl  = (id) => `/attachments/${id}/preview`;
const downloadUrl = (id) => `/attachments/${id}/download`;

function FileIcon({ mimeType, size = 4 }) {
    const cls = `w-${size} h-${size}`;
    if (isImage(mimeType))
        return <svg className={`${cls} text-purple-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    if (isPdf(mimeType))
        return <svg className={`${cls} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    if (mimeType?.includes('word') || mimeType?.includes('document'))
        return <svg className={`${cls} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet'))
        return <svg className={`${cls} text-green-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>;
    return <svg className={`${cls} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
}

// ── Preview Modal ──────────────────────────────────────────────────────────────
function PreviewModal({ doc, onClose }) {
    const [textContent, setTextContent] = useState(null);
    const url = previewUrl(doc.id);

    useEffect(() => {
        if (!isText(doc.mime_type)) return;
        fetch(url, { credentials: 'same-origin' })
            .then(r => r.text())
            .then(setTextContent)
            .catch(() => setTextContent('Inhalt konnte nicht geladen werden.'));
    }, [doc.id]);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-sm" onClick={onClose}>
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-gray-900/95 border-b border-white/10 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 min-w-0">
                    <FileIcon mimeType={doc.mime_type} size={5} />
                    <span className="text-white font-medium text-sm truncate">{doc.original_name}</span>
                    <span className="text-gray-400 text-xs flex-shrink-0">{formatSize(doc.size)}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <a href={downloadUrl(doc.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download
                    </a>
                    <button type="button" onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors" title="Schließen (Esc)">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-6" onClick={e => e.stopPropagation()}>
                {isImage(doc.mime_type) && (
                    <img
                        src={url}
                        alt={doc.original_name}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        style={{ maxHeight: 'calc(100vh - 130px)' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}

                {isPdf(doc.mime_type) && (
                    <iframe
                        src={url}
                        title={doc.original_name}
                        className="w-full rounded-lg shadow-2xl bg-white"
                        style={{ height: 'calc(100vh - 130px)', maxWidth: '1000px' }}
                    />
                )}

                {isText(doc.mime_type) && (
                    <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-auto" style={{ maxHeight: 'calc(100vh - 130px)' }}>
                        {textContent === null ? (
                            <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                                Wird geladen…
                            </div>
                        ) : (
                            <pre className="p-6 text-sm text-gray-800 font-mono whitespace-pre-wrap leading-relaxed">{textContent}</pre>
                        )}
                    </div>
                )}

                {!isPreviewable(doc.mime_type) && (
                    <div className="text-center text-white">
                        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileIcon mimeType={doc.mime_type} size={10} />
                        </div>
                        <p className="text-lg font-medium mb-1">{doc.original_name}</p>
                        <p className="text-gray-400 text-sm mb-6">Dieser Dateityp kann nicht direkt angezeigt werden.</p>
                        <a href={downloadUrl(doc.id)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Herunterladen
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DocumentManager({ folders = [], entityType, entityId }) {
    const [openIds, setOpenIds]         = useState([]);
    const [creatingFolder, setCreating] = useState(false);
    const [newFolderName, setName]      = useState('');
    const [uploadingId, setUploadingId] = useState(null);
    const [draggingId, setDraggingId]   = useState(null);
    const [previewDoc, setPreviewDoc]   = useState(null);

    const toggleOpen = (id) =>
        setOpenIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const handleCreateFolder = (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        router.post('/document-folders', {
            name: newFolderName.trim(),
            folderable_type: entityType,
            folderable_id: entityId,
        }, {
            preserveScroll: true,
            onSuccess: () => { setCreating(false); setName(''); },
        });
    };

    const handleDeleteFolder = (folderId, fileCount) => {
        const msg = fileCount > 0 ? `Ordner und ${fileCount} Datei(en) wirklich löschen?` : 'Ordner wirklich löschen?';
        if (!confirm(msg)) return;
        router.delete(`/document-folders/${folderId}`, { preserveScroll: true });
    };

    const doUpload = (folderId, files) => {
        if (!files?.length) return;
        setUploadingId(folderId);
        router.post('/attachments', {
            files: Array.from(files),
            attachable_type: entityType,
            attachable_id: entityId,
            folder_id: folderId,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setUploadingId(null),
        });
    };

    const handleDrop = (e, folderId) => {
        e.preventDefault();
        setDraggingId(null);
        doUpload(folderId, e.dataTransfer.files);
    };

    const handleDeleteFile = (attachmentId) => {
        if (!confirm('Datei löschen?')) return;
        router.delete(`/attachments/${attachmentId}`, { preserveScroll: true });
    };

    const closePreview = useCallback(() => setPreviewDoc(null), []);

    return (
        <>
            {previewDoc && <PreviewModal doc={previewDoc} onClose={closePreview} />}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <h2 className="text-base font-semibold text-gray-900">Dokumente</h2>
                        {folders.length > 0 && (
                            <span className="text-xs font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{folders.length}</span>
                        )}
                    </div>
                    <button type="button" onClick={() => { setCreating(true); setName(''); }}
                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Neuer Ordner
                    </button>
                </div>

                {/* New folder form */}
                {creatingFolder && (
                    <form onSubmit={handleCreateFolder} className="px-5 py-3 bg-primary-50/50 border-b border-primary-100">
                        <div className="flex gap-2 items-center">
                            <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                            </svg>
                            <input type="text" value={newFolderName} onChange={e => setName(e.target.value)}
                                placeholder="Ordnername..." autoFocus
                                className="flex-1 border border-primary-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" />
                            <button type="submit" className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 font-medium">Erstellen</button>
                            <button type="button" onClick={() => { setCreating(false); setName(''); }}
                                className="px-2 py-1.5 text-gray-500 hover:text-gray-700 text-sm">✕</button>
                        </div>
                    </form>
                )}

                {/* Empty state */}
                {folders.length === 0 && !creatingFolder && (
                    <div className="px-5 py-10 text-center">
                        <svg className="w-10 h-10 text-gray-200 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                        </svg>
                        <p className="text-sm text-gray-400">Noch keine Ordner vorhanden.</p>
                        <button type="button" onClick={() => setCreating(true)}
                            className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                            Ersten Ordner erstellen
                        </button>
                    </div>
                )}

                {/* Folder list */}
                {folders.length > 0 && (
                    <ul className="divide-y divide-gray-50">
                        {folders.map(folder => {
                            const isOpen      = openIds.includes(folder.id);
                            const isDragging  = draggingId === folder.id;
                            const isUploading = uploadingId === folder.id;
                            const fileCount   = folder.attachments?.length ?? 0;
                            const inputId     = `fu-${folder.id}`;

                            return (
                                <li key={folder.id}>
                                    {/* Per-folder hidden file input — triggered by label clicks below */}
                                    <input
                                        type="file"
                                        multiple
                                        id={inputId}
                                        className="hidden"
                                        onChange={e => { doUpload(folder.id, e.target.files); e.target.value = ''; }}
                                    />

                                    {/* Folder row */}
                                    <div
                                        className={`flex items-center gap-2.5 px-4 py-3 cursor-pointer select-none transition-colors ${isDragging ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
                                        onClick={() => toggleOpen(folder.id)}
                                        onDragOver={e => { e.preventDefault(); setDraggingId(folder.id); }}
                                        onDragLeave={() => setDraggingId(null)}
                                        onDrop={e => handleDrop(e, folder.id)}
                                    >
                                        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                                        </svg>
                                        <span className="flex-1 text-sm font-medium text-gray-900 truncate">{folder.name}</span>
                                        <span className="text-xs text-gray-400 flex-shrink-0">{fileCount} Datei{fileCount !== 1 ? 'en' : ''}</span>

                                        {/* Upload — label click triggers the hidden input directly (most reliable) */}
                                        <label
                                            htmlFor={inputId}
                                            onClick={e => e.stopPropagation()}
                                            className={`flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50 flex-shrink-0 cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                            title="Dateien hochladen"
                                        >
                                            {isUploading ? (
                                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                </svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            )}
                                            Upload
                                        </label>

                                        <button type="button"
                                            onClick={e => { e.stopPropagation(); handleDeleteFolder(folder.id, fileCount); }}
                                            title="Ordner löschen"
                                            className="text-gray-300 hover:text-red-500 p-1 rounded flex-shrink-0 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Files inside folder */}
                                    {isOpen && (
                                        <div
                                            className={`border-t border-gray-100 ${isDragging ? 'bg-primary-50/60' : 'bg-gray-50/40'}`}
                                            onDragOver={e => { e.preventDefault(); setDraggingId(folder.id); }}
                                            onDragLeave={() => setDraggingId(null)}
                                            onDrop={e => handleDrop(e, folder.id)}
                                        >
                                            {fileCount === 0 ? (
                                                <label htmlFor={inputId}
                                                    className="block mx-4 my-3 py-4 text-center border-2 border-dashed border-gray-200 hover:border-primary-400 rounded-lg text-sm text-gray-400 hover:text-primary-600 transition-colors cursor-pointer">
                                                    Dateien hierher ziehen oder klicken zum Hochladen
                                                </label>
                                            ) : (
                                                <ul>
                                                    {folder.attachments.map(doc => (
                                                        <li key={doc.id} className="flex items-center gap-3 pl-12 pr-4 py-2.5 hover:bg-gray-100 border-b border-gray-100 last:border-0 group">
                                                            <FileIcon mimeType={doc.mime_type} />

                                                            <button type="button"
                                                                onClick={() => setPreviewDoc(doc)}
                                                                className="flex-1 text-sm text-gray-700 hover:text-primary-600 truncate text-left transition-colors"
                                                                title={isPreviewable(doc.mime_type) ? `${doc.original_name} — klicken zum Anzeigen` : doc.original_name}>
                                                                {doc.original_name}
                                                            </button>

                                                            <span className="text-xs text-gray-400 flex-shrink-0">{formatSize(doc.size)}</span>

                                                            {isPreviewable(doc.mime_type) && (
                                                                <button type="button" onClick={() => setPreviewDoc(doc)} title="Anzeigen"
                                                                    className="text-gray-400 hover:text-primary-600 p-1 rounded flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                </button>
                                                            )}

                                                            <a href={downloadUrl(doc.id)} title="Herunterladen"
                                                                className="text-gray-400 hover:text-primary-600 p-1 rounded flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100"
                                                                onClick={e => e.stopPropagation()}>
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                </svg>
                                                            </a>

                                                            <button type="button" onClick={() => handleDeleteFile(doc.id)} title="Datei löschen"
                                                                className="text-gray-300 hover:text-red-500 p-1 rounded flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </li>
                                                    ))}
                                                    <li className="px-4 py-2">
                                                        <label htmlFor={inputId}
                                                            className={`block w-full text-xs text-gray-400 hover:text-primary-600 border border-dashed border-gray-200 hover:border-primary-400 rounded-lg px-4 py-2 text-center transition-colors cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                            {isUploading ? 'Wird hochgeladen…' : '+ Weitere Dateien hinzufügen'}
                                                        </label>
                                                    </li>
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </>
    );
}
