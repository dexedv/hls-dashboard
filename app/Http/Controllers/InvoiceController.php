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
        $query = Invoice::query()->with('customer');

        if ($request->search) {
            $query->where('number', 'ilike', "%{$request->search}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $invoices = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $projects = Project::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'customers' => $customers,
            'projects' => $projects,
            'filters' => $request->only(['search', 'status']),
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

        // Auto-generate invoice number if not provided
        if (empty($validated['number'])) {
            $year = now()->format('Y');
            $lastInvoice = Invoice::where('number', 'like', "RE-{$year}-%")
                ->orderByRaw("CAST(SUBSTRING(number FROM 'RE-\\d{4}-(\\d+)') AS INTEGER) DESC NULLS LAST")
                ->first();
            $nextNum = 1;
            if ($lastInvoice && preg_match('/RE-\d{4}-(\d+)/', $lastInvoice->number, $matches)) {
                $nextNum = (int)$matches[1] + 1;
            }
            $validated['number'] = "RE-{$year}-" . str_pad($nextNum, 4, '0', STR_PAD_LEFT);
        }

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
        ]);

        $invoice->update($validated);

        return redirect()->route('invoices.index')
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
     * Send invoice via email.
     */
    public function sendEmail(Invoice $invoice)
    {
        $invoice->load('customer');

        $email = $invoice->customer?->email;
        if (!$email) {
            return redirect()->back()->with('error', 'Kunde hat keine E-Mail-Adresse.');
        }

        Mail::to($email)->send(new InvoiceMail($invoice));

        return redirect()->back()->with('success', 'Rechnung wurde per E-Mail gesendet.');
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

        return redirect()->back()->with('success', count($request->ids) . ' Rechnungen aktualisiert.');
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
