<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Project;
use App\Repositories\SupabaseRepository;
use App\Helpers\SupabaseHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices.
     */
    public function index(Request $request)
    {
        if (SupabaseHelper::useSupabase()) {
            $invoices = SupabaseRepository::invoices()->all();

            if ($request->search) {
                $search = strtolower($request->search);
                $invoices = $invoices->filter(function($i) use ($search) {
                    return str_contains(strtolower($i['number'] ?? ''), $search);
                });
            }

            if ($request->status) {
                $invoices = $invoices->where('status', $request->status);
            }

            $invoices = SupabaseHelper::toPaginated($invoices, 10);

            return Inertia::render('Invoices/Index', [
                'invoices' => $invoices,
                'filters' => $request->only(['search', 'status']),
            ]);
        }

        $query = Invoice::query()->with('customer');

        if ($request->search) {
            $query->where('number', 'like', "%{$request->search}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $invoices = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new invoice.
     */
    public function create(Request $request)
    {
        if (SupabaseHelper::useSupabase()) {
            $customers = SupabaseRepository::customers()->all();
            $projects = SupabaseRepository::projects()->all();
            return Inertia::render('Invoices/Create', [
                'customers' => $customers,
                'projects' => $projects,
                'customer_id' => $request->customer_id,
                'project_id' => $request->project_id,
            ]);
        }

        $customers = Customer::all();
        $projects = Project::all();
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

        $tax = $subtotal * 0.19; // 19% tax
        $validated['subtotal'] = $subtotal;
        $validated['tax'] = $tax;
        $validated['total'] = $subtotal + $tax;

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::invoices()->create($validated);
        } else {
            $invoice = Invoice::create($validated);

            // Create invoice items
            foreach ($items as $item) {
                $invoice->items()->create($item);
            }
        }

        return redirect()->route('invoices.index')
            ->with('success', 'Rechnung erfolgreich erstellt.');
    }

    /**
     * Display the specified invoice.
     */
    public function show(Invoice $invoice)
    {
        if (SupabaseHelper::useSupabase()) {
            $invoice = SupabaseRepository::invoices()->find($invoice->id);
            return Inertia::render('Invoices/Show', [
                'invoice' => $invoice,
            ]);
        }

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
        if (SupabaseHelper::useSupabase()) {
            $invoice = SupabaseRepository::invoices()->find($invoice->id);
            $customers = SupabaseRepository::customers()->all();
            $projects = SupabaseRepository::projects()->all();
            return Inertia::render('Invoices/Edit', [
                'invoice' => $invoice,
                'customers' => $customers,
                'projects' => $projects,
            ]);
        }

        $customers = Customer::all();
        $projects = Project::all();
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

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::invoices()->update($invoice->id, $validated);
        } else {
            $invoice->update($validated);
        }

        return redirect()->route('invoices.index')
            ->with('success', 'Rechnung erfolgreich aktualisiert.');
    }

    /**
     * Mark invoice as sent.
     */
    public function send(Invoice $invoice)
    {
        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::invoices()->update($invoice->id, [
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        } else {
            $invoice->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        }

        return redirect()->back()
            ->with('success', 'Rechnung als gesendet markiert.');
    }

    /**
     * Mark invoice as paid.
     */
    public function markPaid(Invoice $invoice)
    {
        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::invoices()->update($invoice->id, [
                'status' => 'paid',
                'paid_at' => now(),
            ]);
        } else {
            $invoice->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);
        }

        return redirect()->back()
            ->with('success', 'Rechnung als bezahlt markiert.');
    }

    /**
     * Remove the specified invoice.
     */
    public function destroy(Invoice $invoice)
    {
        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::invoices()->delete($invoice->id);
        } else {
            $invoice->delete();
        }

        return redirect()->route('invoices.index')
            ->with('success', 'Rechnung erfolgreich gelöscht.');
    }
}
