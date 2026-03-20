<?php

namespace App\Services;

use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class LexwareService
{
    private string $baseUrl;
    private string $apiKey;
    private int $rateLimitMs;
    private float $lastRequestTime;

    public function __construct()
    {
        $this->baseUrl = config('services.lexware.base_url', 'https://api.lexware.io/v1');
        $this->apiKey = config('services.lexware.api_key', env('LEXWARE_API_KEY', ''));
        $this->rateLimitMs = 500; // 2 requests per second = 500ms between requests
        $this->lastRequestTime = 0;
    }

    /**
     * Test the connection to Lexware API
     */
    public function testConnection(): array
    {
        try {
            // Use contacts endpoint to test connection
            $response = $this->get('/contacts', ['size' => 1]);
            return [
                'success' => true,
                'message' => 'Verbindung erfolgreich!',
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check if Lexware is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
    }

    // ==================== CONTACTS ====================

    /**
     * Get all contacts from Lexware
     */
    public function getContacts(array $params = []): array
    {
        return $this->get('/contacts', $params);
    }

    /**
     * Get a single contact by ID
     */
    public function getContact(string $id): array
    {
        return $this->get("/contacts/{$id}");
    }

    /**
     * Create a contact in Lexware
     */
    public function createContact(array $data): array
    {
        return $this->post('/contacts', $data);
    }

    /**
     * Update a contact in Lexware
     */
    public function updateContact(string $id, array $data): array
    {
        return $this->put("/contacts/{$id}", $data);
    }

    /**
     * Delete a contact in Lexware
     */
    public function deleteContact(string $id): array
    {
        return $this->delete("/contacts/{$id}");
    }

    // ==================== INVOICES ====================

    /**
     * Get all invoices from Lexware
     */
    public function getInvoices(array $params = []): array
    {
        return $this->get('/invoices', $params);
    }

    /**
     * Get a single invoice by ID
     */
    public function getInvoice(string $id): array
    {
        return $this->get("/invoices/{$id}");
    }

    /**
     * Create an invoice in Lexware
     */
    public function createInvoice(array $data): array
    {
        return $this->post('/invoices', $data);
    }

    /**
     * Update an invoice in Lexware
     */
    public function updateInvoice(string $id, array $data): array
    {
        return $this->put("/invoices/{$id}", $data);
    }

    /**
     * Delete an invoice in Lexware
     */
    public function deleteInvoice(string $id): array
    {
        return $this->delete("/invoices/{$id}");
    }

    /**
     * Get invoice status from Lexware
     */
    public function getInvoiceStatus(string $id): array
    {
        return $this->get("/invoices/{$id}/status");
    }

    // ==================== QUOTES ====================

    /**
     * Get all quotes from Lexware
     */
    public function getQuotes(array $params = []): array
    {
        return $this->get('/quotes', $params);
    }

    /**
     * Get a single quote by ID
     */
    public function getQuote(string $id): array
    {
        return $this->get("/quotes/{$id}");
    }

    /**
     * Create a quote in Lexware
     */
    public function createQuote(array $data): array
    {
        return $this->post('/quotes', $data);
    }

    /**
     * Update a quote in Lexware
     */
    public function updateQuote(string $id, array $data): array
    {
        return $this->put("/quotes/{$id}", $data);
    }

    /**
     * Delete a quote in Lexware
     */
    public function deleteQuote(string $id): array
    {
        return $this->delete("/quotes/{$id}");
    }

    /**
     * Convert quote to invoice
     */
    public function convertQuoteToInvoice(string $id): array
    {
        return $this->post("/quotes/{$id}/convert");
    }

    // ==================== ACCOUNTING ====================

    /**
     * Get accounting summary
     */
    public function getAccountingSummary(array $params = []): array
    {
        return $this->get('/accounting/summary', $params);
    }

    /**
     * Get open invoices
     */
    public function getOpenInvoices(): array
    {
        return $this->get('/invoices', ['status' => 'open']);
    }

    /**
     * Get overdue invoices
     */
    public function getOverdueInvoices(): array
    {
        return $this->get('/invoices', ['status' => 'overdue']);
    }

    // ==================== SYNC METHODS ====================

    /**
     * Sync customer to Lexware
     */
    public function syncCustomerToLexware($customer): array
    {
        $data = $this->transformCustomerForLexware($customer);

        if ($customer->lexware_id) {
            return $this->updateContact($customer->lexware_id, $data);
        }

        return $this->createContact($data);
    }

    /**
     * Sync invoice to Lexware
     */
    public function syncInvoiceToLexware($invoice): array
    {
        $data = $this->transformInvoiceForLexware($invoice);

        if ($invoice->lexware_id) {
            return $this->updateInvoice($invoice->lexware_id, $data);
        }

        return $this->createInvoice($data);
    }

    /**
     * Sync quote to Lexware
     */
    public function syncQuoteToLexware($quote): array
    {
        $data = $this->transformQuoteForLexware($quote);

        if ($quote->lexware_id) {
            return $this->updateQuote($quote->lexware_id, $data);
        }

        return $this->createQuote($data);
    }

    /**
     * Transform customer data for Lexware format
     */
    public function transformCustomerForLexware($customer): array
    {
        // Determine if it's a business (company) or person
        $isBusiness = !empty($customer->company);

        $data = [];

        if ($isBusiness) {
            $data['company'] = [
                'name' => $customer->company ?: $customer->name,
            ];
        } else {
            // Person contact
            $nameParts = explode(' ', $customer->name, 2);
            $data['person'] = [
                'firstName' => $nameParts[0] ?? '',
                'lastName' => $nameParts[1] ?? $nameParts[0] ?? '',
            ];
        }

        // Roles as nested object - this format is required by Lexware API
        $data['roles'] = [
            'customer' => (object)[],
        ];

        // Basic contact info
        if ($customer->email) {
            $data['email'] = $customer->email;
        }
        if ($customer->phone) {
            $data['phone'] = $customer->phone;
        }

        // Address
        if ($customer->address || $customer->postal_code || $customer->city) {
            $data['address'] = [
                'street' => $customer->address ?? '',
                'postalCode' => $customer->postal_code ?? '',
                'city' => $customer->city ?? '',
                'country' => $customer->country ?? 'DE',
            ];
        }

        // Tax information
        if (!empty($customer->tax_number)) {
            $data['taxNumber'] = $customer->tax_number;
        }
        if (!empty($customer->vat_id)) {
            $data['vatId'] = $customer->vat_id;
        }

        // Industry/Branch
        if (!empty($customer->industry)) {
            $data['industry'] = $customer->industry;
        }

        // Notes - include revenue info if available
        $notes = [];
        if (!empty($customer->notes)) {
            $notes[] = $customer->notes;
        }
        if (!empty($customer->revenue)) {
            $notes[] = 'Umsatz: ' . number_format($customer->revenue, 2, ',', '.') . ' EUR';
        }
        if (!empty($notes)) {
            $data['note'] = implode("\n", $notes);
        }

        return $data;
    }

    /**
     * Transform invoice data for Lexware format
     */
    public function transformInvoiceForLexware($invoice): array
    {
        $items = [];
        foreach ($invoice->items as $item) {
            $items[] = [
                'name' => $item->description,
                'quantity' => $item->quantity,
                'unitPrice' => [
                    'amount' => $item->unit_price,
                    'currency' => 'EUR',
                ],
                'taxRate' => $item->tax_rate ?? 19,
            ];
        }

        return [
            'contactId' => $invoice->customer->lexware_id ?? null,
            'invoiceNumber' => $invoice->number,
            'issueDate' => $invoice->issue_date?->format('Y-m-d'),
            'dueDate' => $invoice->due_date?->format('Y-m-d'),
            'items' => $items,
            'totalAmount' => $invoice->total,
            'currency' => 'EUR',
            'status' => $this->mapInvoiceStatusToLexware($invoice->status),
        ];
    }

    /**
     * Transform quote data for Lexware format
     */
    public function transformQuoteForLexware($quote): array
    {
        $items = [];
        foreach ($quote->items as $item) {
            $items[] = [
                'name' => $item->description,
                'quantity' => $item->quantity,
                'unitPrice' => [
                    'amount' => $item->unit_price,
                    'currency' => 'EUR',
                ],
                'taxRate' => $item->tax_rate ?? 19,
            ];
        }

        return [
            'contactId' => $quote->customer->lexware_id ?? null,
            'quoteNumber' => $quote->number,
            'validUntil' => $quote->valid_until?->format('Y-m-d'),
            'items' => $items,
            'totalAmount' => $quote->total,
            'currency' => 'EUR',
            'status' => $this->mapQuoteStatusToLexware($quote->status),
        ];
    }

    /**
     * Map invoice status to Lexware format
     */
    private function mapInvoiceStatusToLexware(string $status): string
    {
        return match ($status) {
            'draft' => 'draft',
            'sent' => 'open',
            'paid' => 'paid',
            'overdue' => 'overdue',
            'cancelled' => 'cancelled',
            default => 'draft',
        };
    }

    /**
     * Map quote status to Lexware format
     */
    private function mapQuoteStatusToLexware(string $status): string
    {
        return match ($status) {
            'draft' => 'draft',
            'sent' => 'sent',
            'accepted' => 'accepted',
            'declined' => 'declined',
            'expired' => 'expired',
            default => 'draft',
        };
    }

    // ==================== HTTP METHODS ====================

    /**
     * Make a GET request
     */
    public function get(string $endpoint, array $params = []): array
    {
        return $this->request('GET', $endpoint, ['query' => $params]);
    }

    /**
     * Make a POST request
     */
    public function post(string $endpoint, array $data = []): array
    {
        return $this->request('POST', $endpoint, $data);
    }

    /**
     * Make a PUT request
     */
    public function put(string $endpoint, array $data = []): array
    {
        return $this->request('PUT', $endpoint, $data);
    }

    /**
     * Make a DELETE request
     */
    public function delete(string $endpoint): array
    {
        return $this->request('DELETE', $endpoint);
    }

    /**
     * Make an HTTP request with rate limiting
     */
    private function request(string $method, string $endpoint, array $options = []): array
    {
        // Rate limiting
        $this->applyRateLimit();

        $url = $this->baseUrl . $endpoint;

        // Use Guzzle directly for reliable JSON encoding
        $client = new \GuzzleHttp\Client();

        $requestOptions = [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Accept' => 'application/json',
            ],
        ];

        // Add JSON body for POST/PUT/PATCH
        if (in_array($method, ['POST', 'PUT', 'PATCH']) && !empty($options)) {
            $requestOptions['json'] = $options;
        } elseif (!empty($options)) {
            $requestOptions['query'] = $options;
        }

        try {
            $response = $client->$method($url, $requestOptions);

            $this->lastRequestTime = microtime(true);

            $statusCode = $response->getStatusCode();

            if ($statusCode >= 200 && $statusCode < 300) {
                return json_decode($response->getBody()->getContents(), true);
            }

            Log::error('Lexware API Error', [
                'method' => $method,
                'endpoint' => $endpoint,
                'status' => $statusCode,
                'body' => $response->getBody()->getContents(),
            ]);

            throw new Exception('Lexware API error: ' . $statusCode . ' - ' . $response->getBody()->getContents());
        } catch (Exception $e) {
            Log::error('Lexware Request Failed', [
                'method' => $method,
                'endpoint' => $endpoint,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Apply rate limiting
     */
    private function applyRateLimit(): void
    {
        $now = microtime(true);
        $timeSinceLastRequest = ($now - $this->lastRequestTime) * 1000;

        if ($timeSinceLastRequest < $this->rateLimitMs) {
            $sleepTime = ($this->rateLimitMs - $timeSinceLastRequest) / 1000;
            usleep((int)($sleepTime * 1000000));
        }
    }
}
