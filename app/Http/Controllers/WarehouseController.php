<?php

namespace App\Http\Controllers;

use App\Helpers\SupabaseHelper;
use App\Repositories\SupabaseRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    public function index()
    {
        if (SupabaseHelper::useSupabase()) {
            $inventories = SupabaseRepository::inventories()->all();
            $stats = [
                'totalItems' => $inventories->count(),
                'lowStock' => $inventories->filter(function($item) {
                    return ($item['current_stock'] ?? 0) < ($item['min_stock'] ?? 0);
                })->count(),
            ];
        } else {
            $stats = [
                'totalItems' => 0,
                'lowStock' => 0,
            ];
        }

        return Inertia::render('Warehouse/Index', [
            'stats' => $stats,
            'items' => $inventories ?? [],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required',
            'movement_type' => 'required|in:in,out,adjustment,transfer',
            'quantity' => 'required|numeric|min:1',
            'unit_cost' => 'nullable|numeric',
            'supplier_id' => 'nullable',
            'notes' => 'nullable',
        ]);

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::inventoryMovements()->create([
                'item_id' => $validated['item_id'],
                'movement_type' => $validated['movement_type'],
                'quantity' => $validated['quantity'],
                'unit_cost' => $validated['unit_cost'] ?? 0,
                'supplier_id' => $validated['supplier_id'] ?? null,
                'notes' => $validated['notes'] ?? '',
                'movement_date' => now()->toISOString(),
            ]);

            // Update inventory stock
            $inventory = SupabaseRepository::inventories()->find($validated['item_id']);
            if ($inventory) {
                $currentStock = $inventory['current_stock'] ?? 0;
                $change = $validated['movement_type'] === 'in' ? $validated['quantity'] : -$validated['quantity'];
                SupabaseRepository::inventories()->update($validated['item_id'], [
                    'current_stock' => $currentStock + $change,
                ]);
            }
        }

        return redirect('/warehouse')->with('success', 'Lagerbewegung erstellt');
    }
}
