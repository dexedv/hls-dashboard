import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import { useState, useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';

export default function ProductCreate({ categories, inventoryItems }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        sku: '',
        description: '',
        category: '',
        price: '',
        cost: '',
        unit: 'Stück',
        is_active: true,
    });

    const [skuSearch, setSkuSearch] = useState('');
    const [skuOpen, setSkuOpen] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState(null);
    const skuRef = useRef(null);
    const barcodeRef = useRef(null);

    useEffect(() => {
        if (barcodeRef.current && data.sku) {
            try {
                JsBarcode(barcodeRef.current, data.sku, {
                    format: 'CODE128',
                    width: 2,
                    height: 60,
                    displayValue: true,
                    fontSize: 12,
                    margin: 8,
                });
            } catch {
                barcodeRef.current.removeAttribute('data-processed');
            }
        }
    }, [data.sku]);

    const filtered = skuSearch.length > 0
        ? inventoryItems.filter(i =>
            i.sku?.toLowerCase().includes(skuSearch.toLowerCase()) ||
            i.name?.toLowerCase().includes(skuSearch.toLowerCase())
          )
        : inventoryItems;

    const applyInventoryItem = (item) => {
        setSelectedInventory(item);
        setSkuSearch(item.sku || '');
        setSkuOpen(false);
        setData(prev => ({
            ...prev,
            name: item.name || prev.name,
            sku: item.sku || prev.sku,
            description: item.description || prev.description,
            unit: item.unit || prev.unit,
            price: item.unit_price ? String(item.unit_price) : prev.price,
            category: item.category?.name || prev.category,
        }));
    };

    const clearInventory = () => {
        setSelectedInventory(null);
        setSkuSearch('');
        setData(prev => ({ ...prev, sku: '' }));
    };

    useEffect(() => {
        const handler = (e) => {
            if (skuRef.current && !skuRef.current.contains(e.target)) {
                setSkuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('products.store'));
    };

    return (
        <DashboardLayout title="Neues Produkt">
            <Head title="Neues Produkt" />
            <PageHeader title="Neues Produkt" subtitle="Artikel zum Produktkatalog hinzufügen" />

            <div className="max-w-2xl">
                {/* Inventar-Übernahme */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                    <p className="text-sm font-medium text-blue-800 mb-2">Aus Inventar übernehmen</p>
                    <div ref={skuRef} className="relative">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={skuSearch}
                                    onChange={e => { setSkuSearch(e.target.value); setSkuOpen(true); }}
                                    onFocus={() => setSkuOpen(true)}
                                    placeholder="SKU oder Artikelname suchen..."
                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                                />
                                {skuSearch && (
                                    <button type="button" onClick={clearInventory}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {skuOpen && filtered.length > 0 && (
                            <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                                {filtered.slice(0, 50).map(item => (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            onMouseDown={() => applyInventoryItem(item)}
                                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm flex items-center justify-between gap-4"
                                        >
                                            <span className="font-mono text-xs text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                                {item.sku || '—'}
                                            </span>
                                            <span className="flex-1 text-gray-900 truncate">{item.name}</span>
                                            {item.unit_price && (
                                                <span className="text-gray-400 text-xs flex-shrink-0">
                                                    {Number(item.unit_price).toFixed(2)} €
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {skuOpen && skuSearch.length > 0 && filtered.length === 0 && (
                            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-400">
                                Kein Inventareintrag gefunden.
                            </div>
                        )}
                    </div>

                    {selectedInventory && (
                        <p className="text-xs text-blue-600 mt-2">
                            Daten von <strong>{selectedInventory.name}</strong> übernommen — Felder können noch angepasst werden.
                        </p>
                    )}

                    {data.sku && (
                        <div className="mt-3 flex flex-col items-start gap-1">
                            <p className="text-xs text-blue-700 font-medium">Barcode (SKU)</p>
                            <div className="bg-white border border-blue-200 rounded-lg px-4 py-2 inline-block">
                                <svg ref={barcodeRef} />
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU / Artikelnr.</label>
                            <input
                                type="text"
                                value={data.sku}
                                onChange={e => setData('sku', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                                placeholder="z.B. ART-001"
                            />
                            {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                            <input
                                type="text"
                                list="categories-list"
                                value={data.category}
                                onChange={e => setData('category', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            />
                            <datalist id="categories-list">
                                {categories.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Verkaufspreis (€) *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price}
                                onChange={e => setData('price', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                                required
                            />
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Einkaufspreis (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.cost}
                                onChange={e => setData('cost', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Einheit</label>
                            <select
                                value={data.unit}
                                onChange={e => setData('unit', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            >
                                {['Stück', 'kg', 'Liter', 'Stunde', 'Tag', 'Pauschal', 'm', 'm²', 'm³'].map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300 text-primary-600"
                                />
                                <span className="text-sm font-medium text-gray-700">Aktiv (im Katalog sichtbar)</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                        >
                            {processing ? 'Wird gespeichert...' : 'Produkt erstellen'}
                        </button>
                        <Link href={route('products.index')} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                            Abbrechen
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
