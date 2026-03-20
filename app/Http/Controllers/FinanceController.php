<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function index()
    {
        $stats = [
            'totalRevenue' => Invoice::where('status', 'paid')->sum('total'),
            'pendingPayments' => Invoice::whereIn('status', ['sent', 'overdue'])->sum('total'),
            'paidInvoices' => Invoice::where('status', 'paid')->count(),
            'openInvoices' => Invoice::whereIn('status', ['draft', 'sent'])->count(),
        ];

        $recentInvoices = Invoice::with('customer')
            ->latest()
            ->limit(10)
            ->get();

        // Monthly revenue for last 12 months
        $monthlyRevenue = Invoice::where('status', 'paid')
            ->where('created_at', '>=', now()->subMonths(12))
            ->selectRaw("to_char(created_at, 'YYYY-MM') as month, sum(total) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $revenueData = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i)->format('Y-m');
            $label = now()->subMonths($i)->format('M Y');
            $revenueData[] = [
                'month' => $label,
                'total' => (float) ($monthlyRevenue[$month] ?? 0),
            ];
        }

        // Invoice status distribution
        $invoicesByStatus = Invoice::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Top 5 customers by revenue
        $topCustomers = Invoice::where('status', 'paid')
            ->join('customers', 'invoices.customer_id', '=', 'customers.id')
            ->selectRaw('customers.name, sum(invoices.total) as total')
            ->groupBy('customers.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn($c) => ['name' => $c->name, 'total' => (float) $c->total])
            ->toArray();

        return Inertia::render('Finances/Index', [
            'stats' => $stats,
            'recentInvoices' => $recentInvoices,
            'monthlyRevenue' => $revenueData,
            'invoicesByStatus' => $invoicesByStatus,
            'topCustomers' => $topCustomers,
        ]);
    }
}
