<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Project;
use App\Repositories\SupabaseRepository;
use App\Helpers\SupabaseHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    /**
     * Display a listing of inventory items.
     */
    public function index(Request $request)
    {
        if (SupabaseHelper::useSupabase()) {
            $items = SupabaseRepository::inventories()->all();

            if ($request->search) {
                $search = strtolower($request->search);
                $items = $items->filter(function($i) use ($search) {
                    return str_contains(strtolower($i['name'] ?? ''), $search) ||
                           str_contains(strtolower($i['sku'] ?? ''), $search) ||
                           str_contains(strtolower($i['barcode'] ?? ''), $search);
                });
            }

            if ($request->category_id) {
                $items = $items->where('category_id', $request->category_id);
            }

            $items = SupabaseHelper::toPaginated($items, 10);

            return Inertia::render('Inventory/Index', [
                'items' => $items,
                'filters' => $request->only(['search', 'category_id']),
            ]);
        }

        $query = Inventory::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('sku', 'like', "%{$request->search}%")
                    ->orWhere('barcode', 'like', "%{$request->search}%");
            });
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        $items = $query->orderBy('name', 'asc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Inventory/Index', [
            'items' => $items,
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    /**
     * Show the form for creating a new inventory item.
     */
    public function create()
    {
        return Inertia::render('Inventory/Create');
    }

    /**
     * Store a newly created inventory item.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku' => 'nullable|string',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable',
            'unit' => 'nullable|string|max:20',
            'min_stock' => 'nullable|integer|min:0',
            'current_stock' => 'nullable|integer|min:0',
            'location' => 'nullable|string|max:100',
            'barcode' => 'nullable|string',
        ]);

        $validated['min_stock'] = $validated['min_stock'] ?? 0;
        $validated['current_stock'] = $validated['current_stock'] ?? 0;

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::inventories()->create($validated);
        } else {
            Inventory::create($validated);
        }

        return redirect()->route('inventory.index')
            ->with('success', 'Inventarartikel erfolgreich erstellt.');
    }

    /**
     * Display the specified inventory item.
     */
    public function show(Inventory $item)
    {
        if (SupabaseHelper::useSupabase()) {
            $item = SupabaseRepository::inventories()->find($item->id);
            return Inertia::render('Inventory/Show', [
                'item' => $item,
            ]);
        }

        $item->load(['movements', 'category']);

        return Inertia::render('Inventory/Show', [
            'item' => $item,
        ]);
    }

    /**
     * Show the form for editing the specified inventory item.
     */
    public function edit(Inventory $item)
    {
        if (SupabaseHelper::useSupabase()) {
            $item = SupabaseRepository::inventories()->find($item->id);
        }

        return Inertia::render('Inventory/Edit', [
            'item' => $item,
        ]);
    }

    /**
     * Update the specified inventory item.
     */
    public function update(Request $request, Inventory $item)
    {
        $validated = $request->validate([
            'sku' => 'nullable|string',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable',
            'unit' => 'nullable|string|max:20',
            'min_stock' => 'nullable|integer|min:0',
            'current_stock' => 'nullable|integer|min:0',
            'location' => 'nullable|string|max:100',
            'barcode' => 'nullable|string',
        ]);

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::inventories()->update($item->id, $validated);
        } else {
            $item->update($validated);
        }

        return redirect()->route('inventory.index')
            ->with('success', 'Inventarartikel erfolgreich aktualisiert.');
    }

    /**
     * Record stock movement (in/out/adjustment).
     */
    public function recordMovement(Request $request, Inventory $item)
    {
        $validated = $request->validate([
            'type' => 'required|in:in,out,adjustment',
            'quantity' => 'required|integer',
            'project_id' => 'nullable',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = auth()->id();

        if (SupabaseHelper::useSupabase()) {
            $currentItem = SupabaseRepository::inventories()->find($item->id);
            $currentStock = $currentItem['current_stock'] ?? 0;

            // Update stock
            if ($validated['type'] === 'in') {
                $newStock = $currentStock + $validated['quantity'];
            } elseif ($validated['type'] === 'out') {
                $newStock = $currentStock - $validated['quantity'];
            } else {
                $newStock = $validated['quantity'];
            }

            SupabaseRepository::inventories()->update($item->id, ['current_stock' => $newStock]);
        } else {
            // Update stock
            if ($validated['type'] === 'in') {
                $item->current_stock += $validated['quantity'];
            } elseif ($validated['type'] === 'out') {
                $item->current_stock -= $validated['quantity'];
            } else {
                $item->current_stock = $validated['quantity'];
            }

            $item->save();
            $item->movements()->create($validated);
        }

        return redirect()->back()
            ->with('success', 'Lagerbewegung erfasst.');
    }

    /**
     * Remove the specified inventory item.
     */
    public function destroy(Inventory $item)
    {
        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::inventories()->delete($item->id);
        } else {
            $item->delete();
        }

        return redirect()->route('inventory.index')
            ->with('success', 'Inventarartikel erfolgreich gelöscht.');
    }
}
