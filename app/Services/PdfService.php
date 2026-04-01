<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Quote;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;

class PdfService
{
    public static function generateInvoicePdf(Invoice $invoice)
    {
        $invoice->load(['customer', 'items']);
        $taxRate = Setting::get('tax_rate', 19);

        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'taxRate' => $taxRate,
        ]);

        return $pdf;
    }

    public static function generateQuotePdf(Quote $quote)
    {
        $quote->load(['customer', 'items']);
        $taxRate = Setting::get('tax_rate', 19);

        $pdf = Pdf::loadView('pdf.quote', [
            'quote' => $quote,
            'taxRate' => $taxRate,
        ]);

        return $pdf;
    }
}
