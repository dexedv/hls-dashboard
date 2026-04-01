<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Project;
use App\Models\Setting;
use App\Helpers\StatusHelper;
use App\Services\PdfService;
use App\Mail\InvoiceMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices.
     */
    public function index(Request $request)
    {
        $showArchived = $request->boolean('show_archived');
        $query = Invoice::query()->with('customer');

        if ($showArchived) {
            $query->whereNotNull('archived_at');
        } else {
            $query->whereNull('archived_at');
        }

        if ($request->search) {
            $query->where('number', 'ilike', "%{$request->search}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $sort = $request->sort ?? 'created_desc';
        match ($sort) {
            'status'      => $query->orderByRaw("CASE status WHEN 'draft' THEN 1 WHEN 'sent' THEN 2 WHEN 'paid' THEN 3 WHEN 'overdue' THEN 4 WHEN 'cancelled' THEN 5 ELSE 6 END ASC"),
            'due_date'    => $query->orderByRaw('due_date ASC NULLS LAST'),
            'amount_desc' => $query->orderBy('total', 'desc'),
            'created_asc' => $query->orderBy('created_at', 'asc'),
            default       => $query->orderBy('created_at', 'desc'),
        };

        $invoices = $query->paginate(10)->withQueryString();

        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $projects = Project::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'customers' => $customers,
            'projects' => $projects,
            'filters' => (object) $request->only(['search', 'status', 'sort', 'show_archived']),
            'statuses' => StatusHelper::invoiceStatuses(),
        ]);
    }

    /**
     * Show the form for creating a new invoice.
     */
    public function create(Request $request)
    {
        $customers = Customer::orderBy('name')->get(['id', 'name', 'email']);
        $projects = Project::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Invoices/Create', [
            'customers' => $customers,
            'projects' => $projects,
            'customer_id' => $request->customer_id,
            'project_id' => $request->project_id,
        ]);
    }

    /**
     * Store a newly created invoice.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'nullable|string|unique:invoices,number',
            'customer_id' => 'required',
            'project_id' => 'nullable',
            'status' => 'nullable|in:draft,sent,paid,overdue,cancelled',
            'issue_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        // Auto-generate invoice number RE-YYYY-MM-NNNN
        $year   = now()->format('Y');
        $month  = now()->format('m');
        $prefix = "RE-{$year}-{$month}-";
        $lastInvoice = Invoice::where('number', 'like', "{$prefix}%")
            ->orderByRaw("CAST(SUBSTRING(number FROM 'RE-\\d{4}-\\d{2}-(\\d+)') AS INTEGER) DESC NULLS LAST")
            ->first();
        $nextNum = 1;
        if ($lastInvoice && preg_match('/RE-\d{4}-\d{2}-(\d+)/', $lastInvoice->number, $matches)) {
            $nextNum = (int)$matches[1] + 1;
        }
        $validated['number'] = $prefix . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

        $validated['created_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'draft';

        // Calculate totals
        $subtotal = 0;
        $items = $validated['items'] ?? [];
        foreach ($items as &$item) {
            $item['total'] = $item['quantity'] * $item['unit_price'];
            $subtotal += $item['total'];
        }
        unset($item);

        $taxRate = Setting::get('tax_rate', 19);
        $tax = $subtotal * ($taxRate / 100);
        $validated['subtotal'] = $subtotal;
        $validated['tax'] = $tax;
        $validated['total'] = $subtotal + $tax;

        $invoice = Invoice::create($validated);

        // Create invoice items
        foreach ($items as $item) {
            $invoice->items()->create($item);
        }

        return redirect()->route('invoices.index')
            ->with('success', 'Rechnung erfolgreich erstellt.');
    }

    /**
     * Display the specified invoice.
     */
    public function show(Invoice $invoice)
    {
        $invoice->load(['customer', 'project', 'items']);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * Show the form for editing the specified invoice.
     */
    public function edit(Invoice $invoice)
    {
        $customers = Customer::orderBy('name')->get(['id', 'name', 'email']);
        $projects = Project::orderBy('name')->get(['id', 'name']);
        $invoice->load('items');

        return Inertia::render('Invoices/Edit', [
            'invoice' => $invoice,
            'customers' => $customers,
            'projects' => $projects,
        ]);
    }

    /**
     * Update the specified invoice.
     */
    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'number' => 'required|string',
            'customer_id' => 'required',
            'project_id' => 'nullable',
            'status' => 'nullable|in:draft,sent,paid,overdue,cancelled',
            'issue_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $items = $validated['items'] ?? null;
        unset($validated['items']);

        if ($items !== null) {
            $subtotal = 0;
            foreach ($items as &$item) {
                $item['total'] = $item['quantity'] * $item['unit_price'];
                $subtotal += $item['total'];
            }
            unset($item);

            $taxRate = Setting::get('tax_rate', 19);
            $validated['subtotal'] = $subtotal;
            $validated['tax'] = $subtotal * ($taxRate / 100);
            $validated['total'] = $subtotal + $validated['tax'];

            $invoice->items()->delete();
            foreach ($items as $item) {
                $invoice->items()->create($item);
            }
        }

        $invoice->update($validated);

        if (in_array($invoice->status, ['paid', 'cancelled']) && !$invoice->archived_at) {
            $invoice->update(['archived_at' => now()]);
        } elseif (!in_array($invoice->status, ['paid', 'cancelled']) && $invoice->archived_at) {
            $invoice->update(['archived_at' => null]);
        }

        return redirect()->route('invoices.show', $invoice->id)
            ->with('success', 'Rechnung erfolgreich aktualisiert.');
    }

    /**
     * Mark invoice as sent.
     */
    public function send(Invoice $invoice)
    {
        $invoice->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Rechnung als gesendet markiert.');
    }

    /**
     * Mark invoice as paid.
     */
    public function markPaid(Invoice $invoice)
    {
        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'Rechnung als bezahlt markiert.');
    }

    /**
     * Generate PDF for invoice.
     */
    public function pdf(Invoice $invoice)
    {
        $pdf = PdfService::generateInvoicePdf($invoice);
        return $pdf->download('Rechnung_' . $invoice->number . '.pdf');
    }

    /**
     * Send invoice via email and mark as sent.
     */
    public function sendEmail(Invoice $invoice)
    {
        $invoice->load('customer');

        $email = $invoice->customer?->email;
        if (!$email) {
            return redirect()->back()->with('error', 'Kunde hat keine E-Mail-Adresse.');
        }

        $encryption = Setting::get('mail_encryption', 'tls');
        $scheme = ($encryption === 'ssl') ? 'smtps' : 'smtp';
        config([
            'mail.default'               => 'smtp',
            'mail.mailers.smtp.host'     => Setting::get('mail_host'),
            'mail.mailers.smtp.port'     => (int) Setting::get('mail_port', 587),
            'mail.mailers.smtp.username' => Setting::get('mail_username'),
            'mail.mailers.smtp.password' => Setting::get('mail_password'),
            'mail.mailers.smtp.scheme'   => $scheme,
            'mail.mailers.smtp.timeout'  => 10,
            'mail.from.address'          => Setting::get('mail_from_address'),
            'mail.from.name'             => Setting::get('mail_from_name'),
        ]);

        Mail::mailer('smtp')->to($email)->send(new InvoiceMail($invoice));

        $invoice->update(['status' => 'sent']);

        return redirect()->back()->with('success', 'Rechnung wurde per E-Mail gesendet und als "Gesendet" markiert.');
    }

    /**
     * Bulk update status.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:invoices,id',
            'status' => 'required|in:draft,sent,paid,overdue,cancelled',
        ]);

        Invoice::whereIn('id', $request->ids)->update(['status' => $request->status]);

        if (in_array($request->status, ['paid', 'cancelled'])) {
            Invoice::whereIn('id', $request->ids)->whereNull('archived_at')->update(['archived_at' => now()]);
        } else {
            Invoice::whereIn('id', $request->ids)->whereNotNull('archived_at')->update(['archived_at' => null]);
        }

        return redirect()->back()->with('success', count($request->ids) . ' Rechnungen aktualisiert.');
    }

    /**
     * Archive the specified invoice.
     */
    public function archive(Invoice $invoice)
    {
        $invoice->update(['archived_at' => now()]);

        return redirect()->back()->with('success', 'Rechnung archiviert.');
    }

    /**
     * Restore an archived invoice.
     */
    public function restore(Invoice $invoice)
    {
        $invoice->update(['archived_at' => null]);

        return redirect()->back()->with('success', 'Rechnung wiederhergestellt.');
    }

    /**
     * Bulk archive invoices.
     */
    public function bulkArchive(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:invoices,id',
        ]);

        Invoice::whereIn('id', $request->ids)->update(['archived_at' => now()]);

        return redirect()->back()->with('success', count($request->ids) . ' Rechnungen archiviert.');
    }

    /**
     * Remove the specified invoice.
     */
    public function destroy(Invoice $invoice)
    {
        $invoice->delete();

        return redirect()->route('invoices.index')
            ->with('success', 'Rechnung erfolgreich gelöscht.');
    }
}
