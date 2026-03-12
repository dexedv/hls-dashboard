<?php

namespace App\Http\Controllers;

use App\Helpers\SupabaseHelper;
use App\Repositories\SupabaseRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function index()
    {
        if (SupabaseHelper::useSupabase()) {
            $invoices = SupabaseRepository::invoices()->all();
            $stats = [
                'totalRevenue' => $invoices->where('status', 'paid')->sum('total'),
                'pendingPayments' => $invoices->whereIn('status', ['sent', 'overdue'])->sum('total'),
                'paidInvoices' => $invoices->where('status', 'paid')->count(),
                'openInvoices' => $invoices->whereIn('status', ['draft', 'sent'])->count(),
            ];
        } else {
            $stats = [
                'totalRevenue' => 0,
                'pendingPayments' => 0,
                'paidInvoices' => 0,
                'openInvoices' => 0,
            ];
        }

        return Inertia::render('Finances/Index', [
            'stats' => $stats,
        ]);
    }
}
