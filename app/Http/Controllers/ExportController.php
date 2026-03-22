<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Inventory;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function exportCustomers(): StreamedResponse
    {
        $customers = Customer::all();

        return new StreamedResponse(function () use ($customers) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM for Excel
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($handle, ['ID', 'Name', 'Firma', 'E-Mail', 'Telefon', 'Adresse', 'Erstellt am'], ';');
            foreach ($customers as $c) {
                fputcsv($handle, [
                    $c->id,
                    $c->name,
                    $c->company,
                    $c->email,
                    $c->phone,
                    $c->address,
                    $c->created_at?->format('d.m.Y'),
                ], ';');
            }
            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="kunden_export_' . date('Y-m-d') . '.csv"',
        ]);
    }

    public function exportInventory(): StreamedResponse
    {
        $items = Inventory::all();

        return new StreamedResponse(function () use ($items) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($handle, ['ID', 'SKU', 'Name', 'Beschreibung', 'Einheit', 'Bestand', 'Mindestbestand', 'Stückpreis', 'Lagerort', 'Barcode'], ';');
            foreach ($items as $item) {
                fputcsv($handle, [
                    $item->id,
                    $item->sku,
                    $item->name,
                    $item->description,
                    $item->unit,
                    $item->current_stock,
                    $item->min_stock,
                    $item->unit_price,
                    $item->location,
                    $item->barcode,
                ], ';');
            }
            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="inventar_export_' . date('Y-m-d') . '.csv"',
        ]);
    }

    public function exportInvoices(): StreamedResponse
    {
        $invoices = Invoice::with('customer')->get();

        return new StreamedResponse(function () use ($invoices) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($handle, ['ID', 'Nummer', 'Kunde', 'Netto', 'MwSt', 'Brutto', 'Status', 'Rechnungsdatum', 'Fälligkeitsdatum'], ';');
            foreach ($invoices as $inv) {
                fputcsv($handle, [
                    $inv->id,
                    $inv->number,
                    $inv->customer?->name,
                    $inv->subtotal,
                    $inv->tax,
                    $inv->total,
                    $inv->status,
                    $inv->issue_date,
                    $inv->due_date,
                ], ';');
            }
            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="rechnungen_export_' . date('Y-m-d') . '.csv"',
        ]);
    }
}
