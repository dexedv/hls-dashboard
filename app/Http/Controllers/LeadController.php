<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Customer;
use App\Repositories\SupabaseRepository;
use App\Helpers\SupabaseHelper;
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
        if (SupabaseHelper::useSupabase()) {
            $leads = SupabaseRepository::leads()->all();

            if ($request->search) {
                $search = strtolower($request->search);
                $leads = $leads->filter(function($l) use ($search) {
                    return str_contains(strtolower($l['name'] ?? ''), $search) ||
                           str_contains(strtolower($l['company'] ?? ''), $search);
                });
            }

            if ($request->status) {
                $leads = $leads->where('status', $request->status);
            }

            $leads = SupabaseHelper::toPaginated($leads, 10);

            return Inertia::render('Leads/Index', [
                'leads' => $leads,
                'filters' => $request->only(['search', 'status']),
                'statuses' => StatusHelper::leadStatuses(),
            ]);
        }

        $query = Lead::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('company', 'like', "%{$request->search}%");
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
        if (SupabaseHelper::useSupabase()) {
            $customers = SupabaseRepository::customers()->all();
            return Inertia::render('Leads/Create', [
                'customers' => $customers,
                'customer_id' => $request->customer_id,
            ]);
        }

        $customers = Customer::all();
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

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::leads()->create($validated);
        } else {
            Lead::create($validated);
        }

        return redirect()->route('leads.index')
            ->with('success', 'Lead erfolgreich erstellt.');
    }

    /**
     * Display the specified lead.
     */
    public function show(Lead $lead)
    {
        if (SupabaseHelper::useSupabase()) {
            $lead = SupabaseRepository::leads()->find($lead->id);
            return Inertia::render('Leads/Show', [
                'lead' => $lead,
                'statuses' => StatusHelper::leadStatuses(),
            ]);
        }

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
        if (SupabaseHelper::useSupabase()) {
            $lead = SupabaseRepository::leads()->find($lead->id);
            $customers = SupabaseRepository::customers()->all();
            return Inertia::render('Leads/Edit', [
                'lead' => $lead,
                'customers' => $customers,
            ]);
        }

        $customers = Customer::all();
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

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::leads()->update($lead->id, $validated);
        } else {
            $lead->update($validated);
        }

        return redirect()->route('leads.index')
            ->with('success', 'Lead erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified lead.
     */
    public function destroy(Lead $lead)
    {
        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::leads()->delete($lead->id);
        } else {
            $lead->delete();
        }

        return redirect()->route('leads.index')
            ->with('success', 'Lead erfolgreich gelöscht.');
    }
}
