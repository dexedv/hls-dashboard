<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Quote;
use App\Services\LexwareService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Index');
    }

    public function integrations()
    {
        $lexwareService = new LexwareService();
        $isConfigured = $lexwareService->isConfigured();

        $stats = [];
        if ($isConfigured) {
            $stats = [
                'customers_synced' => Customer::where('sync_status', 'synced')->count(),
                'customers_pending' => Customer::where('sync_status', 'pending')->count(),
                'customers_error' => Customer::where('sync_status', 'error')->count(),
                'invoices_synced' => Invoice::whereNotNull('lexware_id')->count(),
                'quotes_synced' => Quote::whereNotNull('lexware_id')->count(),
            ];
        }

        return Inertia::render('Integrations/Index', [
            'lexware' => [
                'is_configured' => $isConfigured,
                'stats' => $stats,
            ],
        ]);
    }

    public function database()
    {
        return Inertia::render('Database/Index');
    }
}
