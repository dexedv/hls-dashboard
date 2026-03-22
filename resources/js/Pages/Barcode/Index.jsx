import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import PageHeader, { Button, IconButton } from '@/Components/PageHeader';
import SearchInput from '@/Components/SearchInput';
import Pagination from '@/Components/Pagination';
import BarcodePreview from '@/Components/BarcodePreview';

const LABEL_SIZES = [
    { id: 'brother-29x90', name: 'Brother 29x90mm', desc: 'DK-11201 Adress-Etiketten', width: 90, height: 29 },
    { id: 'brother-62x29', name: 'Brother 62x29mm', desc: 'DK-11209 Adress-Etiketten', width: 62, height: 29 },
    { id: 'brother-62x100', name: 'Brother 62x100mm', desc: 'DK-11202 Versand-Etiketten', width: 100, height: 62 },
    { id: 'dymo-89x36', name: 'DYMO 89x36mm', desc: '99012 Adress-Etiketten', width: 89, height: 36 },
    { id: 'dymo-57x32', name: 'DYMO 57x32mm', desc: '11354 Mehrzweck', width: 57, height: 32 },
    { id: 'zebra-51x25', name: 'Zebra 51x25mm', desc: 'Kleine Produkt-Etiketten', width: 51, height: 25 },
    { id: 'zebra-102x51', name: 'Zebra 102x51mm', desc: 'Standard-Etiketten', width: 102, height: 51 },
    { id: 'zebra-102x76', name: 'Zebra 102x76mm', desc: 'Grosse Versand-Etiketten', width: 102, height: 76 },
    { id: 'standard-70x36', name: 'Standard 70x36mm', desc: 'Gaengige Thermo-Etiketten', width: 70, height: 36 },
    { id: 'standard-100x50', name: 'Standard 100x50mm', desc: 'Lager-Etiketten', width: 100, height: 50 },
    { id: 'standard-100x150', name: 'Standard 100x150mm', desc: 'Versand-Etiketten gross', width: 100, height: 150 },
    { id: 'avery-64x34', name: 'Avery 64x34mm', desc: 'Avery Zweckform 3422', width: 64, height: 34 },
];

function PrintIcon({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
    );
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generatePrintHTML(items, copiesPerItem, labelSize) {
    const labels = [];
    items.forEach(item => {
        for (let i = 0; i < copiesPerItem; i++) {
            labels.push(item);
        }
    });

    const w = labelSize.width;
    const h = labelSize.height;
    const isSmall = h <= 30;
    const isTall = h >= 60;

    // Dynamic sizing based on label
    const nameFontSize = isSmall ? '7pt' : isTall ? '11pt' : '9pt';
    const metaFontSize = isSmall ? '5.5pt' : isTall ? '8pt' : '6.5pt';
    const codeFontSize = isSmall ? '5.5pt' : isTall ? '8pt' : '6.5pt';
    const barcodeHeight = isSmall ? Math.max(h * 0.55, 14) : isTall ? Math.max(h * 0.4, 40) : Math.max(h * 0.5, 25);
    const barcodeWidth = isSmall ? 1.2 : isTall ? 2.0 : 1.5;
    const padding = isSmall ? '1.5mm' : isTall ? '4mm' : '2.5mm';
    const gap = isSmall ? '1.5mm' : isTall ? '4mm' : '2.5mm';

    // Layout: vertical for tall labels, horizontal for wide labels
    const isVertical = isTall;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Etiketten drucken</title>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; }
    @page { size: ${w}mm ${h}mm; margin: 0; }
    .labels-container { display: flex; flex-wrap: wrap; }
    .label {
        width: ${w}mm;
        height: ${h}mm;
        padding: ${padding};
        display: flex;
        flex-direction: ${isVertical ? 'column' : 'row'};
        align-items: ${isVertical ? 'stretch' : 'center'};
        justify-content: ${isVertical ? 'center' : 'space-between'};
        overflow: hidden;
        page-break-after: always;
        gap: ${gap};
    }
    .label-info {
        ${isVertical ? '' : 'flex: 1; min-width: 0;'}
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
        ${isVertical ? 'order: 2;' : ''}
    }
    .label-name {
        font-size: ${nameFontSize};
        font-weight: 700;
        line-height: 1.2;
        color: #111;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: ${isSmall ? 'nowrap' : 'normal'};
        ${!isSmall ? 'max-height: 2.4em;' : ''}
        ${isVertical ? 'text-align: center;' : ''}
    }
    .label-meta {
        font-size: ${metaFontSize};
        color: #555;
        margin-top: ${isSmall ? '0.3mm' : '1mm'};
        line-height: 1.3;
        display: flex;
        ${isVertical ? 'justify-content: center;' : ''}
        gap: ${isSmall ? '1.5mm' : '3mm'};
        flex-wrap: wrap;
    }
    .label-meta span {
        white-space: nowrap;
    }
    .label-meta .meta-separator {
        color: #ccc;
    }
    .label-barcode {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        ${isVertical ? 'order: 1;' : ''}
    }
    .label-barcode svg {
        ${isVertical ? `max-width: ${w - 8}mm;` : `max-width: ${Math.max(w * 0.55, 30)}mm;`}
        height: auto;
    }
    .label-code {
        font-size: ${codeFontSize};
        color: #333;
        font-family: 'Consolas', 'Courier New', monospace;
        margin-top: 0.5mm;
        text-align: center;
        letter-spacing: 0.5px;
        font-weight: 500;
    }
    @media print {
        body { margin: 0; }
        .label { border: none; }
    }
    @media screen {
        body { background: #f3f4f6; }
        .labels-container { gap: 3mm; padding: 10mm; justify-content: center; }
        .label {
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 2px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
    }
</style>
</head>
<body>
<div class="labels-container">
${labels.map((item, idx) => `
    <div class="label">
        <div class="label-barcode">
            <svg id="bc-${idx}"></svg>
            <div class="label-code">${escapeHtml(item.barcode)}</div>
        </div>
        <div class="label-info">
            <div class="label-name">${escapeHtml(item.name)}</div>
            <div class="label-meta">
                ${item.sku ? '<span>SKU: ' + escapeHtml(item.sku) + '</span>' : ''}
                ${item.sku && item.location ? '<span class="meta-separator">|</span>' : ''}
                ${item.location ? '<span>Lager: ' + escapeHtml(item.location) + '</span>' : ''}
                ${(item.sku || item.location) && item.current_stock != null ? '<span class="meta-separator">|</span>' : ''}
                ${item.current_stock != null ? '<span>Bestand: ' + item.current_stock + ' ' + (item.unit || 'Stk') + '</span>' : ''}
            </div>
        </div>
    </div>
`).join('')}
</div>
<script>
${labels.map((item, idx) => `
try { JsBarcode("#bc-${idx}", "${escapeHtml(item.barcode)}", { format: "CODE128", width: ${barcodeWidth}, height: ${barcodeHeight}, displayValue: false, margin: 0, background: "transparent" }); } catch(e) {}
`).join('')}
window.onload = function() { setTimeout(function() { window.print(); }, 300); };
<\/script>
</body>
</html>`;
}

export default function BarcodeIndex({ items, allItems, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState([]);
    const [copiesPerItem, setCopiesPerItem] = useState(1);
    const [labelSizeId, setLabelSizeId] = useState('brother-29x90');
    const [search, setSearch] = useState(filters?.search || '');

    const selectedLabelSize = LABEL_SIZES.find(s => s.id === labelSizeId) || LABEL_SIZES[0];

    const { data, setData, post, processing, reset } = useForm({
        item_id: '',
        barcode: '',
        type: 'code128',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('barcode.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('barcode.index'), { search }, { preserveState: true });
    };

    const toggleSelect = useCallback((id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    }, []);

    const toggleSelectAll = useCallback(() => {
        const pageIds = (items?.data || []).map(i => i.id);
        const allSelected = pageIds.every(id => selected.includes(id));
        if (allSelected) {
            setSelected(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelected(prev => [...new Set([...prev, ...pageIds])]);
        }
    }, [items, selected]);

    const printLabels = (itemsToPrint) => {
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(generatePrintHTML(itemsToPrint, copiesPerItem, selectedLabelSize));
        win.document.close();
    };

    const printSelected = () => {
        const selectedItems = (items?.data || []).filter(i => selected.includes(i.id));
        if (selectedItems.length === 0) return;
        printLabels(selectedItems);
    };

    const printSingle = (item) => {
        printLabels([item]);
    };

    const pageItems = items?.data || [];
    const pageIds = pageItems.map(i => i.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every(id => selected.includes(id));

    return (
        <DashboardLayout title="Barcode">
            <Head title="Barcode & Etiketten" />

            <PageHeader
                title="Barcode & Etiketten"
                subtitle="Barcode-Vorschau und Etikettendruck"
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Neuer Barcode
                    </Button>
                }
            />

            {/* Search + Label Size + Select All */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            onSubmit={handleSearch}
                            placeholder="Artikel, SKU, Barcode oder Lagerort suchen..."
                            className="flex-1"
                        />
                        {pageItems.length > 0 && (
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    checked={allPageSelected}
                                    onChange={toggleSelectAll}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                Alle auswaehlen
                            </label>
                        )}
                    </div>

                    {/* Label Size Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                            </svg>
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Etikettengroesse:</label>
                        </div>
                        <select
                            value={labelSizeId}
                            onChange={e => setLabelSizeId(e.target.value)}
                            className="flex-1 sm:max-w-md border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            {LABEL_SIZES.map(size => (
                                <option key={size.id} value={size.id}>
                                    {size.name} - {size.desc}
                                </option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                            <span className="text-xs text-gray-500">Groesse:</span>
                            <span className="text-sm font-mono font-medium text-gray-700">{selectedLabelSize.width} x {selectedLabelSize.height} mm</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Grid */}
            {pageItems.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Artikel mit Barcode</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Legen Sie neue Inventar-Artikel an - Barcodes werden automatisch generiert.
                        Oder weisen Sie bestehenden Artikeln einen Barcode zu.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                        {pageItems.map(item => {
                            const isSelected = selected.includes(item.id);
                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white rounded-xl shadow-sm border p-4 transition-all duration-200 hover:shadow-md ${
                                        isSelected ? 'border-primary-400 ring-2 ring-primary-100' : 'border-gray-100'
                                    }`}
                                >
                                    {/* Header: Checkbox + Print */}
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelect(item.id)}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="text-xs text-gray-400">Auswaehlen</span>
                                        </label>
                                        <IconButton onClick={() => printSingle(item)} title="Etikett drucken">
                                            <PrintIcon />
                                        </IconButton>
                                    </div>

                                    {/* Barcode Preview - larger */}
                                    <div className="flex justify-center mb-2 bg-gray-50 rounded-lg p-3">
                                        <BarcodePreview
                                            value={item.barcode}
                                            width={2}
                                            height={60}
                                            displayValue={false}
                                        />
                                    </div>

                                    {/* Barcode Number */}
                                    <p className="text-center text-xs font-mono text-gray-500 mb-3 tracking-widest font-medium">
                                        {item.barcode}
                                    </p>

                                    {/* Item Info */}
                                    <div className="border-t border-gray-100 pt-3 space-y-1.5">
                                        <h3 className="text-sm font-semibold text-gray-900 truncate" title={item.name}>
                                            {item.name}
                                        </h3>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                                            {item.sku && (
                                                <p className="text-xs text-gray-500">
                                                    <span className="text-gray-400">SKU:</span> {item.sku}
                                                </p>
                                            )}
                                            {item.location && (
                                                <p className="text-xs text-gray-500">
                                                    <span className="text-gray-400">Lager:</span> {item.location}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                <span className="text-gray-400">Bestand:</span>{' '}
                                                <span className="font-medium text-gray-700">
                                                    {item.current_stock ?? 0} {item.unit || 'Stk'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {items?.links && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <Pagination
                                links={items.links}
                                from={items.from}
                                to={items.to}
                                total={items.total}
                                entityName="Artikel"
                            />
                        </div>
                    )}
                </>
            )}

            {/* Sticky Print Bar */}
            {selected.length > 0 && (
                <div className="no-print fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 px-6 py-3">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">
                                {selected.length} Artikel ausgewaehlt
                            </span>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-500">Kopien:</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={copiesPerItem}
                                    onChange={(e) => setCopiesPerItem(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-500">Format:</label>
                                <select
                                    value={labelSizeId}
                                    onChange={e => setLabelSizeId(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    {LABEL_SIZES.map(size => (
                                        <option key={size.id} value={size.id}>{size.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="secondary" onClick={() => setSelected([])}>
                                Aufheben
                            </Button>
                            <Button onClick={printSelected}>
                                <PrintIcon className="w-4 h-4 mr-2" />
                                Drucken ({selected.length * copiesPerItem} Etiketten)
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Neuer Barcode</h2>
                            <IconButton onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </IconButton>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Artikel</label>
                                <select value={data.item_id} onChange={e => setData('item_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                    <option value="">Artikel waehlen</option>
                                    {(allItems || []).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode-Typ</label>
                                <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                    <option value="code128">Code 128</option>
                                    <option value="code39">Code 39</option>
                                    <option value="ean13">EAN-13</option>
                                    <option value="ean8">EAN-8</option>
                                    <option value="upc">UPC</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                                <input type="text" value={data.barcode} onChange={e => setData('barcode', e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="z.B. 1234567890123" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Abbrechen</Button>
                                <Button type="submit" disabled={processing}>Speichern</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
