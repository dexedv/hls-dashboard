<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user')
            ->orderBy('created_at', 'desc');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('action', 'ilike', "%{$request->search}%")
                    ->orWhere('description', 'ilike', "%{$request->search}%")
                    ->orWhereHas('user', function ($uq) use ($request) {
                        $uq->where('name', 'ilike', "%{$request->search}%")
                            ->orWhere('email', 'ilike', "%{$request->search}%");
                    });
            });
        }

        if ($request->action) {
            $query->where('action', $request->action);
        }

        $logs = $query->paginate(25)->withQueryString();

        // Transform for frontend compatibility
        $logs->getCollection()->transform(function ($log) {
            return [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description,
                'model_type' => $log->model_type,
                'model_id' => $log->model_id,
                'old_values' => $log->old_values,
                'new_values' => $log->new_values,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'created_at' => $log->created_at,
                'user_name' => $log->user?->name ?? 'System',
                'user_email' => $log->user?->email ?? '',
                'user_role' => $log->user?->role ?? 'system',
            ];
        });

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'action']),
        ]);
    }
}
