<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Project;
use App\Models\Setting;
use App\Helpers\StatusHelper;
use App\Services\PdfService;
use App\Mail\QuoteMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class QuoteController extends Controller
{
    /**
     * Display a listing of quotes.
     */
    public function index(Request $request)
    {
        $showArchived = $request->boolean('show_archived');
        $query = Quote::query()->with('customer');

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
            'status'      => $query->orderByRaw("CASE status WHEN 'draft' THEN 1 WHEN 'sent' THEN 2 WHEN 'accepted' THEN 3 WHEN 'declined' THEN 4 WHEN 'expired' THEN 5 ELSE 6 END ASC"),
            'valid_until' => $query->orderByRaw('valid_until ASC NULLS LAST'),
            'amount_desc' => $query->orderBy('total', 'desc'),
            'created_asc' => $query->orderBy('created_at', 'asc'),
            default       => $query->orderBy('created_at', 'desc'),
        };

        $quotes = $query->paginate(10)->withQueryString();

        $customers = Customer::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Quotes/Index', [
            'quotes' => $quotes,
            'customers' => $customers,
            'filters' => (object) $request->only(['search', 'status', 'sort', 'show_archived']),
            'statuses' => StatusHelper::quoteStatuses(),
        ]);
    }

    /**
     * Show the form for creating a new quote.
     */
    public function create(Request $request)
    {
        $customers = Customer::orderBy('name')->get(['id', 'name', 'email']);
        $projects = Project::orderBy('name')->get(['id', 'name']);
        return Inertia::render('Quotes/Create', [
            'customers' => $customers,
            'projects' => $projects,
            'customer_id' => $request->customer_id,
            'project_id' => $request->project_id,
        ]);
    }

    /**
     * Store a newly created quote.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required',
            'project_id' => 'nullable',
            'status' => 'nullable|in:draft,sent,accepted,declined,expired',
            'valid_until' => 'nullable|date',
            'notes' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        // Auto-generate quote number AG-YYYY-MM-NNNN
        $year   = now()->format('Y');
        $month  = now()->format('m');
        $prefix = "AG-{$year}-{$month}-";
        $lastQuote = Quote::where('number', 'like', "{$prefix}%")
            ->orderByRaw("CAST(SUBSTRING(number FROM 'AG-\\d{4}-\\d{2}-(\\d+)') AS INTEGER) DESC NULLS LAST")
            ->first();
        $nextNum = 1;
        if ($lastQuote && preg_match('/AG-\d{4}-\d{2}-(\d+)/', $lastQuote->number, $matches)) {
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

        $quote = Quote::create($validated);

        foreach ($items as $item) {
            $quote->items()->create($item);
        }

        return redirect()->route('quotes.index')
            ->with('success', 'Angebot erfolgreich erstellt.');
    }

    /**
     * Display the specified quote.
     */
    public function show(Quote $quote)
    {
        $quote->load(['customer', 'project', 'items']);

        return Inertia::render('Quotes/Show', [
            'quote' => $quote,
        ]);
    }

    /**
     * Show the form for editing the specified quote.
     */
    public function edit(Quote $quote)
    {
        $customers = Customer::orderBy('name')->get(['id', 'name', 'email']);
        $projects = Project::orderBy('name')->get(['id', 'name']);
        $quote->load('items');

        return Inertia::render('Quotes/Edit', [
            'quote' => $quote,
            'customers' => $customers,
            'projects' => $projects,
        ]);
    }

    /**
     * Update the specified quote.
     */
    public function update(Request $request, Quote $quote)
    {
        $validated = $request->validate([
            'number' => 'required|string',
            'customer_id' => 'required',
            'project_id' => 'nullable',
            'status' => 'nullable|in:draft,sent,accepted,declined,expired',
            'valid_until' => 'nullable|date',
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

            $quote->items()->delete();
            foreach ($items as $item) {
                $quote->items()->create($item);
            }
        }

        $quote->update($validated);

        if (in_array($quote->status, ['accepted', 'declined', 'expired']) && !$quote->archived_at) {
            $quote->update(['archived_at' => now()]);
        } elseif (!in_array($quote->status, ['accepted', 'declined', 'expired']) && $quote->archived_at) {
            $quote->update(['archived_at' => null]);
        }

        return redirect()->route('quotes.show', $quote->id)
            ->with('success', 'Angebot erfolgreich aktualisiert.');
    }

    /**
     * Send quote via email and mark as sent.
     */
    public function sendEmail(Quote $quote)
    {
        $quote->load('customer');

        $email = $quote->customer?->email;
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

        Mail::mailer('smtp')->to($email)->send(new QuoteMail($quote));

        $quote->update(['status' => 'sent']);

        return redirect()->back()->with('success', 'Angebot wurde per E-Mail gesendet und als "Gesendet" markiert.');
    }

    /**
     * Generate PDF for quote.
     */
    public function pdf(Quote $quote)
    {
        $pdf = PdfService::generateQuotePdf($quote);
        return $pdf->download('Angebot_' . $quote->number . '.pdf');
    }

    /**
     * Archive the specified quote.
     */
    public function archive(Quote $quote)
    {
        $quote->update(['archived_at' => now()]);

        return redirect()->back()->with('success', 'Angebot archiviert.');
    }

    /**
     * Restore an archived quote.
     */
    public function restore(Quote $quote)
    {
        $quote->update(['archived_at' => null]);

        return redirect()->back()->with('success', 'Angebot wiederhergestellt.');
    }

    /**
     * Bulk archive quotes.
     */
    public function bulkArchive(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:quotes,id',
        ]);

        Quote::whereIn('id', $request->ids)->update(['archived_at' => now()]);

        return redirect()->back()->with('success', count($request->ids) . ' Angebote archiviert.');
    }

    /**
     * Convert quote to invoice.
     */
    public function convertToInvoice(Quote $quote)
    {
        $quote->load('items');

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
        $invoiceNumber = $prefix . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

        $invoice = Invoice::create([
            'number'      => $invoiceNumber,
            'customer_id' => $quote->customer_id,
            'project_id'  => $quote->project_id,
            'status'      => 'draft',
            'issue_date'  => now()->toDateString(),
            'due_date'    => now()->addDays(30)->toDateString(),
            'subtotal'    => $quote->subtotal,
            'tax'         => $quote->tax,
            'total'       => $quote->total,
            'notes'       => $quote->notes,
            'created_by'  => auth()->id(),
        ]);

        foreach ($quote->items as $item) {
            $invoice->items()->create([
                'description' => $item->description,
                'quantity'    => $item->quantity,
                'unit_price'  => $item->unit_price,
                'total'       => $item->total,
            ]);
        }

        return redirect()->route('invoices.edit', $invoice->id)
            ->with('success', 'Angebot wurde erfolgreich in eine Rechnung umgewandelt.');
    }

    /**
     * Remove the specified quote.
     */
    public function destroy(Quote $quote)
    {
        $quote->delete();

        return redirect()->route('quotes.index')
            ->with('success', 'Angebot erfolgreich gelöscht.');
    }
}
