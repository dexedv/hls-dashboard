import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';

export default function Create() {
    const { items } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        item_id: '',
        barcode: '',
        type: 'code128',
    });

    const generateBarcode = () => {
        // Generate a random barcode
        const randomBarcode = 'HLS' + Math.random().toString(36).substr(2, 10).toUpperCase();
        setData('barcode', randomBarcode);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/barcode');
    };

    return (
        <DashboardLayout title="Neuer Barcode">
            <Head title="Neuer Barcode" />

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Neuer Barcode</h1>
                        <p className="text-sm text-gray-500 mt-1">Erstellen Sie einen neuen Barcode</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/barcode"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Abbrechen
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                            {processing ? 'Speichern...' : 'Speichern'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Artikel *</label>
                            <select
                                value={data.item_id}
                                onChange={(e) => setData('item_id', e.target.value)}
                                className={`w-full border ${errors.item_id ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                                required
                            >
                                <option value="">Artikel wählen</option>
                                {items && items.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} ({item.sku || 'Keine SKU'})
                                    </option>
                                ))}
                            </select>
                            {errors.item_id && <p className="text-red-500 text-sm mt-1">{errors.item_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Barcode-Typ</label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className={`w-full border ${errors.type ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500`}
                            >
                                <option value="code128">Code 128</option>
                                <option value="code39">Code 39</option>
                                <option value="ean13">EAN-13</option>
                                <option value="ean8">EAN-8</option>
                                <option value="upc">UPC</option>
                                <option value="qr">QR Code</option>
                            </select>
                            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Barcode Nummer</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={data.barcode}
                                    onChange={(e) => setData('barcode', e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                                    placeholder="Barcode eingeben oder generieren"
                                />
                                <button
                                    type="button"
                                    onClick={generateBarcode}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Generieren
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty to auto-generate based on item SKU
                            </p>
                        </div>

                        {/* Barcode Preview */}
                        {data.barcode && (
                            <div className="md:col-span-2 mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-2 text-center">Vorschau</p>
                                <div className="flex justify-center">
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        {/* Simple barcode visualization */}
                                        <svg width="200" height="80" className="mx-auto">
                                            <rect x="10" y="10" width="2" height="60" fill="black" />
                                            <rect x="14" y="10" width="1" height="60" fill="black" />
                                            <rect x="17" y="10" width="3" height="60" fill="black" />
                                            <rect x="22" y="10" width="1" height="60" fill="black" />
                                            <rect x="25" y="10" width="2" height="60" fill="black" />
                                            <rect x="29" y="10" width="1" height="60" fill="black" />
                                            <rect x="32" y="10" width="3" height="60" fill="black" />
                                            <rect x="37" y="10" width="2" height="60" fill="black" />
                                            <rect x="41" y="10" width="1" height="60" fill="black" />
                                            <rect x="44" y="10" width="2" height="60" fill="black" />
                                            <rect x="48" y="10" width="1" height="60" fill="black" />
                                            <rect x="51" y="10" width="3" height="60" fill="black" />
                                            <rect x="56" y="10" width="2" height="60" fill="black" />
                                            <rect x="60" y="10" width="1" height="60" fill="black" />
                                            <rect x="63" y="10" width="2" height="60" fill="black" />
                                            <rect x="67" y="10" width="1" height="60" fill="black" />
                                            <rect x="70" y="10" width="3" height="60" fill="black" />
                                            <rect x="75" y="10" width="2" height="60" fill="black" />
                                            <rect x="79" y="10" width="1" height="60" fill="black" />
                                            <rect x="82" y="10" width="2" height="60" fill="black" />
                                            <rect x="86" y="10" width="1" height="60" fill="black" />
                                            <rect x="89" y="10" width="3" height="60" fill="black" />
                                            <rect x="94" y="10" width="2" height="60" fill="black" />
                                            <rect x="98" y="10" width="1" height="60" fill="black" />
                                            <rect x="101" y="10" width="2" height="60" fill="black" />
                                            <rect x="105" y="10" width="1" height="60" fill="black" />
                                            <rect x="108" y="10" width="3" height="60" fill="black" />
                                            <rect x="113" y="10" width="2" height="60" fill="black" />
                                            <rect x="117" y="10" width="1" height="60" fill="black" />
                                            <rect x="120" y="10" width="2" height="60" fill="black" />
                                            <rect x="124" y="10" width="1" height="60" fill="black" />
                                            <rect x="127" y="10" width="3" height="60" fill="black" />
                                            <rect x="132" y="10" width="2" height="60" fill="black" />
                                            <rect x="136" y="10" width="1" height="60" fill="black" />
                                            <rect x="139" y="10" width="2" height="60" fill="black" />
                                            <rect x="143" y="10" width="1" height="60" fill="black" />
                                            <rect x="146" y="10" width="3" height="60" fill="black" />
                                            <rect x="151" y="10" width="2" height="60" fill="black" />
                                            <rect x="155" y="10" width="1" height="60" fill="black" />
                                            <rect x="158" y="10" width="2" height="60" fill="black" />
                                            <rect x="162" y="10" width="1" height="60" fill="black" />
                                            <rect x="165" y="10" width="3" height="60" fill="black" />
                                            <rect x="170" y="10" width="2" height="60" fill="black" />
                                            <rect x="174" y="10" width="1" height="60" fill="black" />
                                            <rect x="177" y="10" width="2" height="60" fill="black" />
                                            <rect x="181" y="10" width="1" height="60" fill="black" />
                                            <rect x="184" y="10" width="3" height="60" fill="black" />
                                            <rect x="189" y="10" width="2" height="60" fill="black" />
                                        </svg>
                                        <p className="text-center text-xs mt-2 font-mono">{data.barcode}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
