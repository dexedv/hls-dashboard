<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', "%{$request->search}%")
                  ->orWhere('sku', 'ilike', "%{$request->search}%")
                  ->orWhere('category', 'ilike', "%{$request->search}%");
            });
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $products = $query->orderBy('name')->paginate(20)->withQueryString();
        $categories = Product::distinct()->whereNotNull('category')->pluck('category')->sort()->values();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => (object) $request->only(['search', 'category', 'active']),
        ]);
    }

    public function create()
    {
        $categories = Product::distinct()->whereNotNull('category')->pluck('category')->sort()->values();
        $inventoryItems = Inventory::with('category')
            ->orderBy('sku')
            ->get(['id', 'sku', 'name', 'description', 'unit', 'unit_price', 'category_id']);
        return Inertia::render('Products/Create', [
            'categories' => $categories,
            'inventoryItems' => $inventoryItems,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:products,sku',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = auth()->id();
        Product::create($validated);

        return redirect()->route('products.index')->with('success', 'Produkt erfolgreich erstellt.');
    }

    public function show(Product $product)
    {
        return Inertia::render('Products/Show', ['product' => $product]);
    }

    public function edit(Product $product)
    {
        $categories = Product::distinct()->whereNotNull('category')->pluck('category')->sort()->values();
        return Inertia::render('Products/Edit', ['product' => $product, 'categories' => $categories]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:products,sku,' . $product->id,
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $product->update($validated);

        return redirect()->route('products.show', $product->id)->with('success', 'Produkt aktualisiert.');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->route('products.index')->with('success', 'Produkt gelöscht.');
    }

    public function syncFromInventory()
    {
        $inventoryItems = Inventory::with('category')->get();
        $existingSkus   = Product::whereNotNull('sku')->pluck('sku')->flip();

        $count = 0;
        foreach ($inventoryItems as $item) {
            if ($item->sku && isset($existingSkus[$item->sku])) {
                continue;
            }

            Product::create([
                'name'        => $item->name,
                'sku'         => $item->sku,
                'description' => $item->description,
                'unit'        => $item->unit,
                'price'       => $item->unit_price ?? 0,
                'category'    => $item->category?->name,
                'is_active'   => true,
                'created_by'  => auth()->id(),
            ]);
            $count++;
        }

        return redirect()->route('products.index')
            ->with('success', $count . ' Inventarartikel in den Produktkatalog importiert.');
    }
}
