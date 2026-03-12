<?php

namespace App\Console\Commands;

use App\Models\Customer;
use App\Services\LexwareService;
use Illuminate\Console\Command;

class SyncCustomersToLexware extends Command
{
    protected $signature = 'lexware:sync-customers {--dry-run : Nur anzeigen, nicht wirklich synchronisieren}';
    protected $description = 'Synchronisiert Kunden mit Lexware Office';

    public function handle(): int
    {
        $lexware = new LexwareService();

        if (!$lexware->isConfigured()) {
            $this->error('Lexware ist nicht konfiguriert. Bitte API-Key setzen.');
            return Command::FAILURE;
        }

        // Kunden die noch nicht synchronisiert wurden
        $customers = Customer::where(function ($query) {
            $query->where('sync_status', '!=', 'synced')
                  ->orWhereNull('sync_status');
        })->get();

        if ($customers->isEmpty()) {
            $this->info('Keine Kunden zu synchronisieren.');
            return Command::SUCCESS;
        }

        $this->info("{$customers->count()} Kunden werden synchronisiert...");

        $synced = 0;
        $failed = 0;

        foreach ($customers as $customer) {
            if ($this->option('dry-run')) {
                $this->line("Would sync: {$customer->name}");
                continue;
            }

            try {
                $result = $lexware->syncCustomerToLexware($customer);

                if (isset($result['id'])) {
                    $customer->update([
                        'lexware_id' => $result['id'],
                        'sync_status' => 'synced',
                        'last_synced_at' => now(),
                    ]);
                    $synced++;
                    $this->line("✓ {$customer->name} synchronisiert");
                } else {
                    $failed++;
                    $this->warn("✗ {$customer->name} fehlgeschlagen");
                }
            } catch (\Exception $e) {
                $failed++;
                $customer->update(['sync_status' => 'error']);
                $this->error("✗ {$customer->name}: " . $e->getMessage());
            }
        }

        $this->info("Fertig! {$synced} synchronisiert, {$failed} fehlgeschlagen.");

        return Command::SUCCESS;
    }
}
