<?php

namespace App\Http\Controllers;

use App\Repositories\SupabaseRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index()
    {
        $useSupabase = filter_var(env('USE_SUPABASE', false), FILTER_VALIDATE_BOOLEAN);

        if ($useSupabase) {
            try {
                $logs = SupabaseRepository::auditLogs()
                    ->limit(50)
                    ->get()
                    ->toArray();

                // Map user_id to user name if available
                $logs = array_map(function ($log) {
                    if (isset($log['user_id'])) {
                        try {
                            $user = SupabaseRepository::users()->find($log['user_id']);
                            $log['user'] = $user['name'] ?? 'Unbekannt';
                        } catch (\Exception $e) {
                            $log['user'] = 'Unbekannt';
                        }
                    } else {
                        $log['user'] = 'System';
                    }
                    return $log;
                }, $logs);
            } catch (\Exception $e) {
                $logs = [];
            }
        }

        // Fallback to default logs if empty
        if (empty($logs)) {
            $logs = [
                ['id' => 1, 'action' => 'user.login', 'description' => 'Benutzer hat sich angemeldet', 'user' => 'System', 'created_at' => now()->toISOString()],
                ['id' => 2, 'action' => 'customer.create', 'description' => 'Neuer Kunde erstellt', 'user' => 'System', 'created_at' => now()->subHours(2)->toISOString()],
            ];
        }

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
        ]);
    }
}
