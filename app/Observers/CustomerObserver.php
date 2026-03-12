<?php

namespace App\Observers;

use App\Models\Customer;
use App\Services\LexwareService;
use Illuminate\Support\Facades\Log;

class CustomerObserver
{
    protected LexwareService $lexware;

    public function __construct()
    {
        $this->lexware = new LexwareService();
    }

    /**
     * Automatischer Sync nach dem Erstellen
     */
    public function created(Customer $customer): void
    {
        if (!$this->lexware->isConfigured()) {
            return;
        }

        // Kurz warten um sicherzustellen, dass alle Felder gesetzt sind
        $customer->refresh();

        try {
            $result = $this->lexware->syncCustomerToLexware($customer);

            if (isset($result['id'])) {
                $customer->update([
                    'lexware_id' => $result['id'],
                    'sync_status' => 'synced',
                    'last_synced_at' => now(),
                ]);

                Log::info("Kunde automatisch zu Lexware synchronisiert", [
                    'customer_id' => $customer->id,
                    'lexware_id' => $result['id'],
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Automatischer Lexware-Sync fehlgeschlagen", [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
            ]);

            $customer->update(['sync_status' => 'error']);
        }
    }

    /**
     * Automatischer Sync nach dem Aktualisieren
     */
    public function updated(Customer $customer): void
    {
        if (!$this->lexware->isConfigured()) {
            return;
        }

        // Nur syncen wenn bereits eine lexware_id existiert
        if (!$customer->lexware_id) {
            return;
        }

        try {
            $result = $this->lexware->syncCustomerToLexware($customer);

            $customer->update([
                'sync_status' => 'synced',
                'last_synced_at' => now(),
            ]);

            Log::info("Kunde automatisch in Lexware aktualisiert", [
                'customer_id' => $customer->id,
                'lexware_id' => $customer->lexware_id,
            ]);
        } catch (\Exception $e) {
            Log::error("Automatischer Lexware-Update fehlgeschlagen", [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
            ]);

            $customer->update(['sync_status' => 'error']);
        }
    }

    /**
     * Optional: Kunde aus Lexware löschen wenn local gelöscht
     */
    public function deleted(Customer $customer): void
    {
        if (!$this->lexware->isConfigured() || !$customer->lexware_id) {
            return;
        }

        try {
            $this->lexware->deleteContact($customer->lexware_id);

            Log::info("Kunde aus Lexware gelöscht", [
                'customer_id' => $customer->id,
                'lexware_id' => $customer->lexware_id,
            ]);
        } catch (\Exception $e) {
            Log::error("Löschen aus Lexware fehlgeschlagen", [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
