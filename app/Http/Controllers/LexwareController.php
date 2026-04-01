<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Quote;
use App\Services\LexwareService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LexwareController extends Controller
{
    protected LexwareService $lexwareService;

    public function __construct()
    {
        $this->lexwareService = new LexwareService();
    }

    /**
     * Show Lexware integration page
     */
    public function index(Request $request)
    {
        $isConfigured = $this->lexwareService->isConfigured();

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

    /**
     * Test Lexware connection
     */
    public function testConnection(Request $request)
    {
        $result = $this->lexwareService->testConnection();

        return response()->json($result);
    }

    /**
     * Save Lexware API key
     */
    public function saveApiKey(Request $request)
    {
        $request->validate([
            'api_key' => 'required|string',
        ]);

        // Save to .env file or config
        $apiKey = $request->input('api_key');

        // Update runtime config
        config(['services.lexware.api_key' => $apiKey]);

        // Test connection
        $result = $this->lexwareService->testConnection();

        return response()->json($result);
    }

    // ==================== CUSTOMER SYNC ====================

    /**
     * Sync a customer to Lexware
     */
    public function syncCustomer(Request $request, Customer $customer)
    {
        try {
            $result = $this->lexwareService->syncCustomerToLexware($customer);

            if (isset($result['id'])) {
                $customer->update([
                    'lexware_id' => $result['id'],
                    'sync_status' => 'synced',
                    'last_synced_at' => now(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Customer synced successfully',
                    'lexware_id' => $result['id'],
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to sync customer',
            ], 400);
        } catch (\Exception $e) {
            Log::error('Lexware customer sync error', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
            ]);

            $customer->update(['sync_status' => 'error']);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync all customers to Lexware
     */
    public function syncAllCustomers(Request $request)
    {
        $customers = Customer::where('sync_status', '!=', 'synced')
            ->orWhereNull('sync_status')
            ->get();

        $synced = 0;
        $failed = 0;

        foreach ($customers as $customer) {
            try {
                $result = $this->lexwareService->syncCustomerToLexware($customer);

                if (isset($result['id'])) {
                    $customer->update([
                        'lexware_id' => $result['id'],
                        'sync_status' => 'synced',
                        'last_synced_at' => now(),
                    ]);
                    $synced++;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                $customer->update(['sync_status' => 'error']);
                $failed++;
            }
        }

        return response()->json([
            'success' => true,
            'synced' => $synced,
            'failed' => $failed,
        ]);
    }

    /**
     * Import customers from Lexware
     */
    public function importCustomers(Request $request)
    {
        try {
            $result = $this->lexwareService->getContacts();

            $imported = 0;
            $contacts = $result['data'] ?? $result;

            foreach ($contacts as $contact) {
                // Check if customer already exists
                $existing = Customer::where('lexware_id', $contact['id'])->first();

                if (!$existing) {
                    Customer::create([
                        'name' => $contact['name'] ?? 'Unknown',
                        'company' => $contact['company'] ?? null,
                        'email' => $contact['email'] ?? null,
                        'phone' => $contact['phone'] ?? null,
                        'address' => $contact['address']['street'] ?? null,
                        'lexware_id' => $contact['id'],
                        'sync_status' => 'synced',
                        'last_synced_at' => now(),
                    ]);
                    $imported++;
                }
            }

            return response()->json([
                'success' => true,
                'imported' => $imported,
            ]);
        } catch (\Exception $e) {
            Log::error('Lexware import customers error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // ==================== INVOICE SYNC ====================

    /**
     * Sync an invoice to Lexware
     */
    public function syncInvoice(Request $request, Invoice $invoice)
    {
        try {
            // Load relationships
            $invoice->load(['customer', 'items']);

            $result = $this->lexwareService->syncInvoiceToLexware($invoice);

            if (isset($result['id'])) {
                $invoice->update([
                    'lexware_id' => $result['id'],
                    'lexware_status' => $result['status'] ?? null,
                    'last_synced_at' => now(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Invoice synced successfully',
                    'lexware_id' => $result['id'],
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to sync invoice',
            ], 400);
        } catch (\Exception $e) {
            Log::error('Lexware invoice sync error', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync all invoices to Lexware
     */
    public function syncAllInvoices(Request $request)
    {
        $invoices = Invoice::whereNull('lexware_id')
            ->whereIn('status', ['draft', 'sent'])
            ->get();

        $synced = 0;
        $failed = 0;

        foreach ($invoices as $invoice) {
            try {
                $invoice->load(['customer', 'items']);
                $result = $this->lexwareService->syncInvoiceToLexware($invoice);

                if (isset($result['id'])) {
                    $invoice->update([
                        'lexware_id' => $result['id'],
                        'lexware_status' => $result['status'] ?? null,
                        'last_synced_at' => now(),
                    ]);
                    $synced++;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                $failed++;
            }
        }

        return response()->json([
            'success' => true,
            'synced' => $synced,
            'failed' => $failed,
        ]);
    }

    /**
     * Import invoices from Lexware
     */
    public function importInvoices(Request $request)
    {
        try {
            $result = $this->lexwareService->getInvoices();

            $imported = 0;
            $invoices = $result['data'] ?? $result;

            foreach ($invoices as $invoiceData) {
                // Check if invoice already exists
                $existing = Invoice::where('lexware_id', $invoiceData['id'])->first();

                if (!$existing && !empty($invoiceData['contactId'])) {
                    // Find customer by lexware_id
                    $customer = Customer::where('lexware_id', $invoiceData['contactId'])->first();

                    if ($customer) {
                        Invoice::create([
                            'number' => $invoiceData['invoiceNumber'] ?? $invoiceData['number'],
                            'customer_id' => $customer->id,
                            'status' => $this->mapLexwareStatus($invoiceData['status'] ?? 'draft'),
                            'total' => $invoiceData['totalAmount'] ?? $invoiceData['total'] ?? 0,
                            'lexware_id' => $invoiceData['id'],
                            'lexware_status' => $invoiceData['status'] ?? null,
                            'last_synced_at' => now(),
                        ]);
                        $imported++;
                    }
                }
            }

            return response()->json([
                'success' => true,
                'imported' => $imported,
            ]);
        } catch (\Exception $e) {
            Log::error('Lexware import invoices error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // ==================== QUOTE SYNC ====================

    /**
     * Sync a quote to Lexware
     */
    public function syncQuote(Request $request, Quote $quote)
    {
        try {
            // Load relationships
            $quote->load(['customer', 'items']);

            $result = $this->lexwareService->syncQuoteToLexware($quote);

            if (isset($result['id'])) {
                $quote->update([
                    'lexware_id' => $result['id'],
                    'lexware_status' => $result['status'] ?? null,
                    'last_synced_at' => now(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Quote synced successfully',
                    'lexware_id' => $result['id'],
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to sync quote',
            ], 400);
        } catch (\Exception $e) {
            Log::error('Lexware quote sync error', [
                'quote_id' => $quote->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync all quotes to Lexware
     */
    public function syncAllQuotes(Request $request)
    {
        $quotes = Quote::whereNull('lexware_id')
            ->whereIn('status', ['draft', 'sent'])
            ->get();

        $synced = 0;
        $failed = 0;

        foreach ($quotes as $quote) {
            try {
                $quote->load(['customer', 'items']);
                $result = $this->lexwareService->syncQuoteToLexware($quote);

                if (isset($result['id'])) {
                    $quote->update([
                        'lexware_id' => $result['id'],
                        'lexware_status' => $result['status'] ?? null,
                        'last_synced_at' => now(),
                    ]);
                    $synced++;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                $failed++;
            }
        }

        return response()->json([
            'success' => true,
            'synced' => $synced,
            'failed' => $failed,
        ]);
    }

    // ==================== HELPERS ====================

    /**
     * Map Lexware status to internal status
     */
    private function mapLexwareStatus(string $status): string
    {
        return match ($status) {
            'draft' => 'draft',
            'open', 'sent' => 'sent',
            'paid' => 'paid',
            'overdue' => 'overdue',
            'cancelled' => 'cancelled',
            default => 'draft',
        };
    }
}
