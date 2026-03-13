<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\Customer;
use App\Models\Project;
use App\Repositories\SupabaseRepository;
use App\Helpers\SupabaseHelper;
use App\Helpers\StatusHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuoteController extends Controller
{
    /**
     * Display a listing of quotes.
     */
    public function index(Request $request)
    {
        if (SupabaseHelper::useSupabase()) {
            $quotes = SupabaseRepository::quotes()->all();

            if ($request->search) {
                $search = strtolower($request->search);
                $quotes = $quotes->filter(function($q) use ($search) {
                    return str_contains(strtolower($q['number'] ?? ''), $search);
                });
            }

            if ($request->status) {
                $quotes = $quotes->where('status', $request->status);
            }

            $quotes = SupabaseHelper::toPaginated($quotes, 10);

            return Inertia::render('Quotes/Index', [
                'quotes' => $quotes,
                'filters' => $request->only(['search', 'status']),
                'statuses' => StatusHelper::quoteStatuses(),
            ]);
        }

        $query = Quote::query()->with('customer');

        if ($request->search) {
            $query->where('number', 'like', "%{$request->search}%");
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $quotes = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Quotes/Index', [
            'quotes' => $quotes,
            'filters' => $request->only(['search', 'status']),
            'statuses' => StatusHelper::quoteStatuses(),
        ]);
    }

    /**
     * Show the form for creating a new quote.
     */
    public function create(Request $request)
    {
        if (SupabaseHelper::useSupabase()) {
            $customers = SupabaseRepository::customers()->all();
            $projects = SupabaseRepository::projects()->all();
            return Inertia::render('Quotes/Create', [
                'customers' => $customers,
                'projects' => $projects,
                'customer_id' => $request->customer_id,
                'project_id' => $request->project_id,
            ]);
        }

        $customers = Customer::all();
        $projects = Project::all();
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

        $tax = $subtotal * 0.19;
        $validated['subtotal'] = $subtotal;
        $validated['tax'] = $tax;
        $validated['total'] = $subtotal + $tax;

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::quotes()->create($validated);
        } else {
            $quote = Quote::create($validated);

            foreach ($items as $item) {
                $quote->items()->create($item);
            }
        }

        return redirect()->route('quotes.index')
            ->with('success', 'Angebot erfolgreich erstellt.');
    }

    /**
     * Display the specified quote.
     */
    public function show(Quote $quote)
    {
        if (SupabaseHelper::useSupabase()) {
            $quote = SupabaseRepository::quotes()->find($quote->id);
            return Inertia::render('Quotes/Show', [
                'quote' => $quote,
            ]);
        }

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
        if (SupabaseHelper::useSupabase()) {
            $quote = SupabaseRepository::quotes()->find($quote->id);
            $customers = SupabaseRepository::customers()->all();
            $projects = SupabaseRepository::projects()->all();
            return Inertia::render('Quotes/Edit', [
                'quote' => $quote,
                'customers' => $customers,
                'projects' => $projects,
            ]);
        }

        $customers = Customer::all();
        $projects = Project::all();
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
        ]);

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::quotes()->update($quote->id, $validated);
        } else {
            $quote->update($validated);
        }

        return redirect()->route('quotes.index')
            ->with('success', 'Angebot erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified quote.
     */
    public function destroy(Quote $quote)
    {
        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::quotes()->delete($quote->id);
        } else {
            $quote->delete();
        }

        return redirect()->route('quotes.index')
            ->with('success', 'Angebot erfolgreich gelöscht.');
    }
}
