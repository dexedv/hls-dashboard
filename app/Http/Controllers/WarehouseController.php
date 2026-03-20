<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    public function index(Request $request)
    {
        $allItems = Inventory::all();

        $stats = [
            'totalItems' => $allItems->count(),
            'lowStock' => $allItems->filter(fn($item) => $item->isLowStock())->count(),
            'totalValue' => $allItems->sum(fn($item) => $item->current_stock * ($item->unit_price ?? 0)),
        ];

        $query = Inventory::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', "%{$request->search}%")
                    ->orWhere('sku', 'ilike', "%{$request->search}%");
            });
        }

        $items = $query->orderBy('name')
            ->paginate(25)
            ->withQueryString();

        $recentMovements = InventoryMovement::with('inventory')
            ->latest()
            ->limit(20)
            ->get();

        // All items for dropdown (unpaginated)
        $allItemsList = Inventory::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Warehouse/Index', [
            'stats' => $stats,
            'items' => $items,
            'allItems' => $allItemsList,
            'recentMovements' => $recentMovements,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:inventories,id',
            'movement_type' => 'required|in:in,out,adjustment,transfer',
            'quantity' => 'required|numeric|min:1',
            'unit_cost' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        InventoryMovement::create([
            'inventory_id' => $validated['item_id'],
            'type' => $validated['movement_type'],
            'quantity' => $validated['quantity'],
            'unit_cost' => $validated['unit_cost'] ?? 0,
            'notes' => $validated['notes'] ?? '',
            'created_by' => auth()->id(),
        ]);

        // Update stock
        $inventory = Inventory::findOrFail($validated['item_id']);
        $change = $validated['movement_type'] === 'in' ? $validated['quantity'] : -$validated['quantity'];
        $inventory->increment('current_stock', $change);

        return redirect('/warehouse')->with('success', 'Lagerbewegung erstellt.');
    }
}
