<?php

namespace App\Http\Controllers;

use App\Helpers\SupabaseHelper;
use App\Repositories\SupabaseRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BarcodeController extends Controller
{
    public function index()
    {
        $items = [];
        if (SupabaseHelper::useSupabase()) {
            $items = SupabaseRepository::inventories()->all()->toArray();
        }

        return Inertia::render('Barcode/Index', [
            'items' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required',
            'barcode' => 'required',
            'type' => 'required|in:code128,code39,ean13,ean8,upc,qr',
        ]);

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::inventories()->update($validated['item_id'], [
                'barcode' => $validated['barcode'],
            ]);
        }

        return redirect('/barcode')->with('success', 'Barcode erstellt');
    }
}
