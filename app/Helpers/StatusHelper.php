<?php

namespace App\Helpers;

class StatusHelper
{
    /**
     * Get status options for projects
     */
    public static function projectStatuses(): array
    {
        return [
            ['value' => 'planning', 'label' => 'Planung', 'color' => 'bg-blue-100 text-blue-800'],
            ['value' => 'active', 'label' => 'Aktiv', 'color' => 'bg-green-100 text-green-800'],
            ['value' => 'completed', 'label' => 'Abgeschlossen', 'color' => 'bg-gray-100 text-gray-800'],
            ['value' => 'on_hold', 'label' => 'Pausiert', 'color' => 'bg-yellow-100 text-yellow-800'],
            ['value' => 'cancelled', 'label' => 'Abgebrochen', 'color' => 'bg-red-100 text-red-800'],
        ];
    }

    /**
     * Get status options for tasks
     */
    public static function taskStatuses(): array
    {
        return [
            ['value' => 'todo', 'label' => 'Zu erledigen', 'color' => 'bg-gray-100 text-gray-800'],
            ['value' => 'in_progress', 'label' => 'In Bearbeitung', 'color' => 'bg-blue-100 text-blue-800'],
            ['value' => 'review', 'label' => 'In Prüfung', 'color' => 'bg-yellow-100 text-yellow-800'],
            ['value' => 'done', 'label' => 'Erledigt', 'color' => 'bg-green-100 text-green-800'],
        ];
    }

    /**
     * Get priority options for tasks/projects
     */
    public static function priorities(): array
    {
        return [
            ['value' => 'low', 'label' => 'Niedrig', 'color' => 'bg-gray-100 text-gray-800'],
            ['value' => 'medium', 'label' => 'Mittel', 'color' => 'bg-blue-100 text-blue-800'],
            ['value' => 'high', 'label' => 'Hoch', 'color' => 'bg-orange-100 text-orange-800'],
            ['value' => 'urgent', 'label' => 'Dringend', 'color' => 'bg-red-100 text-red-800'],
        ];
    }

    /**
     * Get status options for leads
     */
    public static function leadStatuses(): array
    {
        return [
            ['value' => 'new', 'label' => 'Neu', 'color' => 'bg-blue-100 text-blue-800'],
            ['value' => 'contacted', 'label' => 'Kontaktiert', 'color' => 'bg-yellow-100 text-yellow-800'],
            ['value' => 'qualified', 'label' => 'Qualifiziert', 'color' => 'bg-purple-100 text-purple-800'],
            ['value' => 'proposal', 'label' => 'Angebot', 'color' => 'bg-indigo-100 text-indigo-800'],
            ['value' => 'won', 'label' => 'Gewonnen', 'color' => 'bg-green-100 text-green-800'],
            ['value' => 'lost', 'label' => 'Verloren', 'color' => 'bg-red-100 text-red-800'],
        ];
    }

    /**
     * Get status options for invoices
     */
    public static function invoiceStatuses(): array
    {
        return [
            ['value' => 'draft', 'label' => 'Entwurf', 'color' => 'bg-gray-100 text-gray-800'],
            ['value' => 'sent', 'label' => 'Gesendet', 'color' => 'bg-blue-100 text-blue-800'],
            ['value' => 'paid', 'label' => 'Bezahlt', 'color' => 'bg-green-100 text-green-800'],
            ['value' => 'overdue', 'label' => 'Überfällig', 'color' => 'bg-red-100 text-red-800'],
            ['value' => 'cancelled', 'label' => 'Storniert', 'color' => 'bg-gray-200 text-gray-600'],
        ];
    }

    /**
     * Get status options for quotes
     */
    public static function quoteStatuses(): array
    {
        return [
            ['value' => 'draft', 'label' => 'Entwurf', 'color' => 'bg-gray-100 text-gray-800'],
            ['value' => 'sent', 'label' => 'Gesendet', 'color' => 'bg-blue-100 text-blue-800'],
            ['value' => 'accepted', 'label' => 'Angenommen', 'color' => 'bg-green-100 text-green-800'],
            ['value' => 'declined', 'label' => 'Abgelehnt', 'color' => 'bg-red-100 text-red-800'],
            ['value' => 'expired', 'label' => 'Abgelaufen', 'color' => 'bg-yellow-100 text-yellow-800'],
        ];
    }

    /**
     * Get status options for vacation requests
     */
    public static function vacationStatuses(): array
    {
        return [
            ['value' => 'pending', 'label' => 'Ausstehend', 'color' => 'bg-yellow-100 text-yellow-800'],
            ['value' => 'approved', 'label' => 'Genehmigt', 'color' => 'bg-green-100 text-green-800'],
            ['value' => 'rejected', 'label' => 'Abgelehnt', 'color' => 'bg-red-100 text-red-800'],
        ];
    }

    /**
     * Get status options for tickets
     */
    public static function ticketStatuses(): array
    {
        return [
            ['value' => 'open', 'label' => 'Offen', 'color' => 'bg-blue-100 text-blue-800'],
            ['value' => 'in_progress', 'label' => 'In Bearbeitung', 'color' => 'bg-yellow-100 text-yellow-800'],
            ['value' => 'pending', 'label' => 'Wartend', 'color' => 'bg-purple-100 text-purple-800'],
            ['value' => 'resolved', 'label' => 'Gelöst', 'color' => 'bg-green-100 text-green-800'],
            ['value' => 'closed', 'label' => 'Geschlossen', 'color' => 'bg-gray-100 text-gray-800'],
        ];
    }
}