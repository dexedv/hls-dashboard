<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #333; }
        .company-info { margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #1a56db; }
        .company-details { font-size: 11px; color: #555; margin-top: 4px; }
        .quote-title { font-size: 28px; font-weight: bold; color: #1a56db; margin-bottom: 20px; }
        .meta-table { width: 100%; margin-bottom: 30px; }
        .meta-table td { padding: 4px 0; }
        .meta-label { font-weight: bold; width: 150px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th { background: #1a56db; color: white; padding: 10px 8px; text-align: left; font-size: 11px; }
        .items-table td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
        .items-table tr:nth-child(even) { background: #f9fafb; }
        .totals { margin-top: 20px; width: 300px; margin-left: auto; }
        .totals td { padding: 5px 8px; }
        .totals .total-row { font-weight: bold; font-size: 14px; border-top: 2px solid #1a56db; }
        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #6b7280; text-align: center; }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    @php
        $companyName = \App\Models\Setting::get('company_name', config('app.name', 'Dashboard'));
        $companyAddress = \App\Models\Setting::get('company_address', '');
        $companyZip = \App\Models\Setting::get('company_zip', '');
        $companyCity = \App\Models\Setting::get('company_city', '');
        $companyPhone = \App\Models\Setting::get('company_phone', '');
        $companyEmail = \App\Models\Setting::get('company_email', '');
        $companyTaxId = \App\Models\Setting::get('company_tax_id', '');
        $companyVatId = \App\Models\Setting::get('company_vat_id', '');
        $currency = \App\Models\Setting::get('currency', 'EUR');
        $addressLine = implode(', ', array_filter([$companyAddress, implode(' ', array_filter([$companyZip, $companyCity]))]));
    @endphp

    <div class="company-info">
        <div class="company-name">{{ $companyName }}</div>
        @if($addressLine)
            <div class="company-details">{{ $addressLine }}</div>
        @endif
        @if($companyPhone || $companyEmail)
            <div class="company-details">
                {{ implode(' | ', array_filter([$companyPhone, $companyEmail])) }}
            </div>
        @endif
        @if($companyTaxId || $companyVatId)
            <div class="company-details">
                {{ implode(' | ', array_filter([$companyTaxId ? 'St.-Nr.: ' . $companyTaxId : '', $companyVatId ? 'USt-IdNr.: ' . $companyVatId : ''])) }}
            </div>
        @endif
    </div>

    <div class="quote-title">ANGEBOT</div>

    <table class="meta-table">
        <tr>
            <td class="meta-label">Angebotsnr.:</td>
            <td>{{ $quote->number }}</td>
            <td class="meta-label">Kunde:</td>
            <td>{{ $quote->customer?->name ?? '-' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Gueltig bis:</td>
            <td>{{ $quote->valid_until ? \Carbon\Carbon::parse($quote->valid_until)->format('d.m.Y') : '-' }}</td>
            <td class="meta-label">Firma:</td>
            <td>{{ $quote->customer?->company ?? '-' }}</td>
        </tr>
    </table>

    @if($quote->items && count($quote->items) > 0)
    <table class="items-table">
        <thead>
            <tr>
                <th>Pos.</th>
                <th>Beschreibung</th>
                <th class="text-right">Menge</th>
                <th class="text-right">Einzelpreis</th>
                <th class="text-right">Gesamt</th>
            </tr>
        </thead>
        <tbody>
            @foreach($quote->items as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->description }}</td>
                <td class="text-right">{{ number_format($item->quantity, 0) }}</td>
                <td class="text-right">{{ number_format($item->unit_price, 2, ',', '.') }} {{ $currency }}</td>
                <td class="text-right">{{ number_format($item->total, 2, ',', '.') }} {{ $currency }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <table class="totals">
        <tr>
            <td>Nettobetrag:</td>
            <td class="text-right">{{ number_format($quote->subtotal ?? 0, 2, ',', '.') }} {{ $currency }}</td>
        </tr>
        <tr>
            <td>MwSt. ({{ $taxRate }}%):</td>
            <td class="text-right">{{ number_format($quote->tax ?? 0, 2, ',', '.') }} {{ $currency }}</td>
        </tr>
        <tr class="total-row">
            <td>Gesamtbetrag:</td>
            <td class="text-right">{{ number_format($quote->total ?? 0, 2, ',', '.') }} {{ $currency }}</td>
        </tr>
    </table>

    @if($quote->notes)
    <div style="margin-top: 30px;">
        <strong>Anmerkungen:</strong><br>
        {{ $quote->notes }}
    </div>
    @endif

    <div class="footer">
        {{ $companyName }}{{ $addressLine ? ' | ' . $addressLine : '' }}
    </div>
</body>
</html>
