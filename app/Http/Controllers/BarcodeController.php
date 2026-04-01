<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BarcodeController extends Controller
{
    public function index(Request $request)
    {
        $query = Inventory::whereNotNull('barcode')->where('barcode', '!=', '');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', "%{$request->search}%")
                    ->orWhere('sku', 'ilike', "%{$request->search}%")
                    ->orWhere('barcode', 'ilike', "%{$request->search}%")
                    ->orWhere('location', 'ilike', "%{$request->search}%");
            });
        }

        $items = $query->orderBy('name')
            ->paginate(24, ['id', 'name', 'sku', 'barcode', 'location', 'current_stock', 'unit'])
            ->withQueryString();

        // All items for dropdown (unpaginated)
        $allItems = Inventory::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Barcode/Index', [
            'items' => $items,
            'allItems' => $allItems,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:inventories,id',
            'barcode' => 'required|string',
            'type' => 'required|in:code128,code39,ean13,ean8,upc,qr',
        ]);

        $inventory = Inventory::findOrFail($validated['item_id']);
        $inventory->update(['barcode' => $validated['barcode']]);

        return redirect()->route('barcode.index')->with('success', 'Barcode gespeichert.');
    }
}
