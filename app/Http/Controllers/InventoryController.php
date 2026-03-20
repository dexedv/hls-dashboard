<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    /**
     * Display a listing of inventory items.
     */
    public function index(Request $request)
    {
        $query = Inventory::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', "%{$request->search}%")
                    ->orWhere('sku', 'ilike', "%{$request->search}%")
                    ->orWhere('barcode', 'ilike', "%{$request->search}%");
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

        if (empty($validated['barcode'])) {
            $validated['barcode'] = $this->generateBarcode();
        }

        Inventory::create($validated);

        return redirect()->route('inventory.index')
            ->with('success', 'Inventarartikel erfolgreich erstellt.');
    }

    /**
     * Display the specified inventory item.
     */
    public function show(Inventory $item)
    {
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

        $item->update($validated);

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

        return redirect()->back()
            ->with('success', 'Lagerbewegung erfasst.');
    }

    /**
     * Remove the specified inventory item.
     */
    public function destroy(Inventory $item)
    {
        $item->delete();

        return redirect()->route('inventory.index')
            ->with('success', 'Inventarartikel erfolgreich gelöscht.');
    }

    /**
     * Generate a unique EAN-13 barcode with prefix 200 (internal use per GS1).
     */
    private function generateBarcode(): string
    {
        $lastBarcode = Inventory::where('barcode', 'like', '200%')
            ->whereRaw('LENGTH(barcode) = 13')
            ->orderByDesc('barcode')
            ->value('barcode');

        if ($lastBarcode) {
            $lastNumber = (int) substr($lastBarcode, 0, 12);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 200000000001;
        }

        $digits = str_pad((string) $nextNumber, 12, '0', STR_PAD_LEFT);

        // EAN-13 check digit calculation
        $sum = 0;
        for ($i = 0; $i < 12; $i++) {
            $sum += (int) $digits[$i] * ($i % 2 === 0 ? 1 : 3);
        }
        $checkDigit = (10 - ($sum % 10)) % 10;

        return $digits . $checkDigit;
    }
}
