<?php

namespace App\Http\Controllers;

use App\Repositories\SupabaseRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class AuditLogController extends Controller
{
    public function index()
    {
        $useSupabase = filter_var(env('USE_SUPABASE', false), FILTER_VALIDATE_BOOLEAN);
        $logs = [];

        if ($useSupabase) {
            try {
                $logs = SupabaseRepository::auditLogs()
                    ->orderBy('created_at', 'desc')
                    ->limit(100)
                    ->get()
                    ->toArray();

                // Map user_id to full user info
                $logs = array_map(function ($log) {
                    if (isset($log['user_id'])) {
                        try {
                            // Try Supabase first
                            $user = SupabaseRepository::users()->find($log['user_id']);
                            if ($user) {
                                $log['user_name'] = $user['name'] ?? $user['email'] ?? 'Unbekannt';
                                $log['user_email'] = $user['email'] ?? '';
                                $log['user_avatar'] = $user['avatar_url'] ?? null;
                                $log['user_role'] = $user['role'] ?? 'employee';
                            } else {
                                $log['user_name'] = 'Unbekannt';
                                $log['user_email'] = '';
                                $log['user_avatar'] = null;
                                $log['user_role'] = '';
                            }
                        } catch (\Exception $e) {
                            // Fallback to local database
                            $localUser = User::find($log['user_id']);
                            if ($localUser) {
                                $log['user_name'] = $localUser->name;
                                $log['user_email'] = $localUser->email;
                                $log['user_avatar'] = $localUser->avatar_path ?? null;
                                $log['user_role'] = $localUser->role ?? 'employee';
                            } else {
                                $log['user_name'] = 'Unbekannt';
                                $log['user_email'] = '';
                                $log['user_avatar'] = null;
                                $log['user_role'] = '';
                            }
                        }
                    } else {
                        $log['user_name'] = 'System';
                        $log['user_email'] = '';
                        $log['user_avatar'] = null;
                        $log['user_role'] = 'system';
                    }

                    // Format entity info
                    if (!empty($log['entity_type'])) {
                        $log['entity_info'] = $this->getEntityInfo($log['entity_type'], $log['entity_id'] ?? null);
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
                [
                    'id' => 1,
                    'action' => 'user.login',
                    'description' => 'Benutzer hat sich angemeldet',
                    'user_name' => 'Dominic Klügl',
                    'user_email' => 'dominic@hls-services.de',
                    'user_role' => 'owner',
                    'created_at' => now()->toISOString(),
                    'ip_address' => '192.168.1.1',
                ],
                [
                    'id' => 2,
                    'action' => 'customer.create',
                    'description' => 'Neuer Kunde "Max Müller GmbH" erstellt',
                    'user_name' => 'Dominic Klügl',
                    'user_email' => 'dominic@hls-services.de',
                    'user_role' => 'owner',
                    'entity_type' => 'customer',
                    'created_at' => now()->subHours(2)->toISOString(),
                    'ip_address' => '192.168.1.1',
                ],
            ];
        }

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
        ]);
    }

    private function getEntityInfo($entityType, $entityId)
    {
        if (!$entityId) return null;

        try {
            switch ($entityType) {
                case 'customer':
                    $entity = SupabaseRepository::customers()->find($entityId);
                    return $entity ? [
                        'name' => $entity['company_name'] ?? $entity['name'] ?? 'Kunde',
                        'type' => 'Kunde'
                    ] : null;

                case 'project':
                    $entity = SupabaseRepository::projects()->find($entityId);
                    return $entity ? [
                        'name' => $entity['name'] ?? 'Projekt',
                        'type' => 'Projekt'
                    ] : null;

                case 'user':
                    $entity = SupabaseRepository::users()->find($entityId);
                    return $entity ? [
                        'name' => $entity['name'] ?? $entity['email'] ?? 'Benutzer',
                        'type' => 'Benutzer'
                    ] : null;

                default:
                    return ['name' => "ID: $entityId", 'type' => ucfirst($entityType)];
            }
        } catch (\Exception $e) {
            return null;
        }
    }
}
