import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader, { Button } from '@/Components/PageHeader';
import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export default function ProductShow({ product }) {
    const barcodeRef = useRef(null);

    useEffect(() => {
        if (barcodeRef.current && product.sku) {
            try {
                JsBarcode(barcodeRef.current, product.sku, {
                    format: 'CODE128',
                    width: 2,
                    height: 60,
                    displayValue: true,
                    fontSize: 12,
                    margin: 10,
                });
            } catch {}
        }
    }, [product.sku]);
    const handleDelete = () => {
        if (!confirm('Produkt wirklich löschen?')) return;
        router.delete(route('products.destroy', product.id));
    };

    const margin = product.cost && product.price > 0
        ? (((product.price - product.cost) / product.price) * 100).toFixed(1)
        : null;

    return (
        <DashboardLayout title={product.name}>
            <Head title={product.name} />
            <PageHeader
                title={product.name}
                subtitle={product.category || 'Produkt'}
                actions={
                    <div className="flex gap-2">
                        <Link href={route('products.edit', product.id)}>
                            <Button variant="secondary">Bearbeiten</Button>
                        </Link>
                        <Button variant="danger" onClick={handleDelete}>Löschen</Button>
                    </div>
                }
            />

            <div className="max-w-2xl space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div>
                            <p className="text-gray-500">SKU / Artikelnr.</p>
                            <p className="font-medium font-mono mt-0.5">{product.sku || '—'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Kategorie</p>
                            <p className="font-medium mt-0.5">{product.category || '—'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Einheit</p>
                            <p className="font-medium mt-0.5">{product.unit}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-0.5 ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {product.is_active ? 'Aktiv' : 'Inaktiv'}
                            </span>
                        </div>
                        <div>
                            <p className="text-gray-500">Verkaufspreis</p>
                            <p className="text-xl font-bold text-gray-900 mt-0.5">
                                {Number(product.price).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                            </p>
                        </div>
                        {product.cost && (
                            <div>
                                <p className="text-gray-500">Einkaufspreis</p>
                                <p className="font-medium mt-0.5">
                                    {Number(product.cost).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                    {margin && <span className="ml-2 text-green-600 text-xs">({margin}% Marge)</span>}
                                </p>
                            </div>
                        )}
                    </div>

                    {product.description && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Beschreibung</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.description}</p>
                        </div>
                    )}

                    {product.sku && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-3">Barcode</p>
                            <svg ref={barcodeRef} />
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
