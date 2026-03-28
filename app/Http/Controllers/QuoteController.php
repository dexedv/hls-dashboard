<?php

namespace App\Http\Controllers;

use App\Models\Quote;
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
        $query = Quote::query()->with('customer');

        if ($request->search) {
            $query->where('number', 'ilike', "%{$request->search}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $quotes = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $customers = Customer::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Quotes/Index', [
            'quotes' => $quotes,
            'customers' => $customers,
            'filters' => $request->only(['search', 'status']),
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

        Mail::to($email)->send(new QuoteMail($quote));

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
     * Remove the specified quote.
     */
    public function destroy(Quote $quote)
    {
        $quote->delete();

        return redirect()->route('quotes.index')
            ->with('success', 'Angebot erfolgreich gelöscht.');
    }
}
