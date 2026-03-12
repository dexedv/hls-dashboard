<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Repositories\SupabaseRepository;
use App\Helpers\SupabaseHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers.
     */
    public function index(Request $request)
    {
        if (SupabaseHelper::useSupabase()) {
            $customers = SupabaseRepository::customers()->all();

            // Apply search filter
            if ($request->search) {
                $search = strtolower($request->search);
                $customers = $customers->filter(function($c) use ($search) {
                    return str_contains(strtolower($c['name'] ?? ''), $search) ||
                           str_contains(strtolower($c['company'] ?? ''), $search) ||
                           str_contains(strtolower($c['email'] ?? ''), $search);
                });
            }

            $customers = SupabaseHelper::toPaginated($customers, 10);

            return Inertia::render('Customers/Index', [
                'customers' => $customers,
                'filters' => $request->only(['search']),
            ]);
        }

        // Use Eloquent (SQLite)
        $query = Customer::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('company', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $customers = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    /**
     * Show the form for creating a new customer.
     */
    public function create()
    {
        return Inertia::render('Customers/Create');
    }

    /**
     * Store a newly created customer.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();

        if (SupabaseHelper::useSupabase()) {
            // Only send fields that exist in Supabase
            $data = [
                'name' => $validated['name'],
                'company' => $validated['company'] ?? null,
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $validated['created_by'],
                'created_at' => now()->toISOString(),
            ];
            SupabaseRepository::customers()->create($data);
        } else {
            Customer::create($validated);
        }

        return redirect()->route('customers.index')
            ->with('success', 'Kunde erfolgreich erstellt.');
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer)
    {
        if (SupabaseHelper::useSupabase()) {
            $customer = SupabaseRepository::customers()->find($customer->id);
            return Inertia::render('Customers/Show', [
                'customer' => $customer,
            ]);
        }

        $customer->load(['projects', 'leads', 'creator']);

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
        ]);
    }

    /**
     * Show the form for editing the specified customer.
     */
    public function edit(Customer $customer)
    {
        if (SupabaseHelper::useSupabase()) {
            $customer = SupabaseRepository::customers()->find($customer->id);
        }

        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified customer.
     */
    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if (SupabaseHelper::useSupabase()) {
            // Only send fields that exist in Supabase
            $data = [
                'name' => $validated['name'],
                'company' => $validated['company'] ?? null,
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'updated_at' => now()->toISOString(),
            ];
            SupabaseRepository::customers()->update($customer->id, $data);
        } else {
            $customer->update($validated);
        }

        return redirect()->route('customers.index')
            ->with('success', 'Kunde erfolgreich aktualisiert.');
    }

    /**
     * Remove the specified customer.
     */
    public function destroy(Customer $customer)
    {
        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::customers()->delete($customer->id);
        } else {
            $customer->delete();
        }

        return redirect()->route('customers.index')
            ->with('success', 'Kunde erfolgreich gelöscht.');
    }
}
