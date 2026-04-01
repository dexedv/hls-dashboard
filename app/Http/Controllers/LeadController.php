<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Customer;
use App\Helpers\StatusHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadController extends Controller
{
    /**
     * Display a listing of leads.
     */
    public function index(Request $request)
    {
        $query = Lead::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', "%{$request->search}%")
                    ->orWhere('company', 'ilike', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $leads = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Leads/Index', [
            'leads' => $leads,
            'filters' => $request->only(['search', 'status']),
            'statuses' => StatusHelper::leadStatuses(),
        ]);
    }

    /**
     * Show the form for creating a new lead.
     */
    public function create(Request $request)
    {
        $customers = Customer::orderBy('name')->get(['id', 'name', 'email']);
        return Inertia::render('Leads/Create', [
            'customers' => $customers,
            'customer_id' => $request->customer_id,
        ]);
    }

    /**
     * Store a newly created lead.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'value' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:new,contacted,qualified,proposal,won,lost',
            'source' => 'nullable|string|max:100',
            'customer_id' => 'nullable',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'new';

        Lead::create($validated);

        return redirect()->route('leads.index')
            ->with('success', 'Lead erfolgreich erstellt.');
    }

    /**
     * Display the specified lead.
     */
    public function show(Lead $lead)
    {
        $lead->load(['customer', 'creator']);
        return Inertia::render('Leads/Show', [
            'lead' => $lead,
            'statuses' => StatusHelper::leadStatuses(),
        ]);
    }

    /**
     * Show the form for editing the specified lead.
     */
    public function edit(Lead $lead)
    {
        $customers = Customer::orderBy('name')->get(['id', 'name', 'email']);
        return Inertia::render('Leads/Edit', [
            'lead' => $lead,
            'customers' => $customers,
        ]);
    }

    /**
     * Update the specified lead.
     */
    public function update(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'value' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:new,contacted,qualified,proposal,won,lost',
            'source' => 'nullable|string|max:100',
            'customer_id' => 'nullable',
        ]);

        $lead->update($validated);

        return redirect()->route('leads.index')
            ->with('success', 'Lead erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified lead.
     */
    public function destroy(Lead $lead)
    {
        $lead->delete();

        return redirect()->route('leads.index')
            ->with('success', 'Lead erfolgreich gelöscht.');
    }
}
