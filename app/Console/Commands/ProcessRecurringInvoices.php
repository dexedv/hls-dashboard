<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\Setting;
use Illuminate\Console\Command;

class ProcessRecurringInvoices extends Command
{
    protected $signature = 'invoices:process-recurring';
    protected $description = 'Process recurring invoices that are due today';

    public function handle(): void
    {
        $today = now()->toDateString();

        $dueInvoices = Invoice::where('is_recurring', true)
            ->whereNotNull('recurring_interval')
            ->whereNotNull('recurring_next_date')
            ->whereDate('recurring_next_date', '<=', $today)
            ->where(function ($q) use ($today) {
                $q->whereNull('recurring_end_date')
                  ->orWhereDate('recurring_end_date', '>=', $today);
            })
            ->get();

        foreach ($dueInvoices as $template) {
            $this->createRecurringCopy($template);
        }

        $this->info("Processed {$dueInvoices->count()} recurring invoices.");
    }

    private function createRecurringCopy(Invoice $template): void
    {
        // Clone the invoice
        $newInvoice = $template->replicate(['number', 'status', 'sent_at', 'paid_at', 'is_recurring', 'recurring_next_date']);
        $newInvoice->status = 'draft';
        $newInvoice->is_recurring = false;
        $newInvoice->recurring_parent_id = $template->id;

        // Generate new invoice number
        $year = now()->format('Y');
        $last = Invoice::where('number', 'like', "RE-{$year}-%")->count();
        $newInvoice->number = "RE-{$year}-" . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
        $newInvoice->issue_date = now()->toDateString();

        if ($template->due_date && $template->issue_date) {
            $diff = $template->issue_date->diffInDays($template->due_date);
            $newInvoice->due_date = now()->addDays($diff)->toDateString();
        }

        $newInvoice->save();

        // Copy items
        foreach ($template->items as $item) {
            $newInvoice->items()->create($item->only(['description', 'quantity', 'unit_price', 'total']));
        }

        // Advance the next date on the template
        $nextDate = match ($template->recurring_interval) {
            'monthly'   => now()->addMonth(),
            'quarterly' => now()->addMonths(3),
            'yearly'    => now()->addYear(),
            default     => null,
        };

        if ($nextDate) {
            $template->update(['recurring_next_date' => $nextDate->toDateString()]);
        }
    }
}
