<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\InventoryCategory;
use App\Models\Product;
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

        $sort = $request->sort ?? 'low_stock';
        if ($sort === 'low_stock') {
            $query->orderByRaw('(current_stock - COALESCE(min_stock, 0)) ASC');
        } elseif ($sort === 'stock_asc') {
            $query->orderBy('current_stock', 'asc');
        } elseif ($sort === 'stock_desc') {
            $query->orderBy('current_stock', 'desc');
        } else {
            $query->orderBy('name', 'asc');
        }

        $items = $query->paginate(10)->withQueryString();

        return Inertia::render('Inventory/Index', [
            'items' => $items,
            'filters' => (object) $request->only(['search', 'category_id', 'sort']),
            'nextSku' => $this->generateSku(),
        ]);
    }

    /**
     * Show the form for creating a new inventory item.
     */
    public function create()
    {
        return Inertia::render('Inventory/Create', [
            'nextSku' => $this->generateSku(),
        ]);
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
            'unit_price' => 'nullable|numeric|min:0',
        ]);

        $validated['min_stock'] = $validated['min_stock'] ?? 0;
        $validated['current_stock'] = $validated['current_stock'] ?? 0;
        $validated['unit_price'] = $validated['unit_price'] ?? 0;

        if (empty($validated['sku'])) {
            $validated['sku'] = $this->generateSku();
        }

        if (empty($validated['barcode'])) {
            $validated['barcode'] = $this->generateBarcode();
        }

        $item = Inventory::create($validated);

        // Automatisch in Produktkatalog übernehmen (falls SKU noch nicht vorhanden)
        $existingProduct = $item->sku ? Product::where('sku', $item->sku)->first() : null;
        if (!$existingProduct) {
            $categoryName = $item->category_id
                ? InventoryCategory::find($item->category_id)?->name
                : null;

            Product::create([
                'name'        => $item->name,
                'sku'         => $item->sku,
                'description' => $item->description,
                'unit'        => $item->unit,
                'price'       => $item->unit_price ?? 0,
                'category'    => $categoryName,
                'is_active'   => true,
                'created_by'  => auth()->id(),
            ]);
        }

        return redirect()->route('inventory.index')
            ->with('success', 'Inventarartikel erfolgreich erstellt und in Produktkatalog übernommen.');
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
            'unit_price' => 'nullable|numeric|min:0',
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
     * Bulk delete inventory items.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:inventories,id',
        ]);

        Inventory::whereIn('id', $request->ids)->delete();

        return redirect()->back()->with('success', count($request->ids) . ' Artikel gelöscht.');
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
     * Generate a unique sequential SKU like ART-00042.
     */
    private function generateSku(): string
    {
        $last = Inventory::where('sku', 'like', 'ART-%')
            ->orderByDesc('sku')
            ->value('sku');

        $next = $last ? ((int) substr($last, 4)) + 1 : 1;

        return 'ART-' . str_pad((string) $next, 5, '0', STR_PAD_LEFT);
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

        $sum = 0;
        for ($i = 0; $i < 12; $i++) {
            $sum += (int) $digits[$i] * ($i % 2 === 0 ? 1 : 3);
        }
        $checkDigit = (10 - ($sum % 10)) % 10;

        return $digits . $checkDigit;
    }
}
