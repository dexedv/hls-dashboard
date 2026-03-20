<?php

namespace App\Traits;

use App\Models\AuditLog;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            $model->logAudit('created', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $dirty = $model->getDirty();
            if (empty($dirty)) {
                return;
            }
            $old = array_intersect_key($model->getOriginal(), $dirty);
            $model->logAudit('updated', $old, $dirty);
        });

        static::deleted(function ($model) {
            $model->logAudit('deleted', $model->getOriginal(), null);
        });
    }

    protected function logAudit(string $event, ?array $oldValues, ?array $newValues): void
    {
        $modelName = strtolower(class_basename(static::class));
        $action = "{$modelName}.{$event}";

        $description = match ($event) {
            'created' => ucfirst($modelName) . ' erstellt',
            'updated' => ucfirst($modelName) . ' aktualisiert',
            'deleted' => ucfirst($modelName) . ' gelöscht',
            default => ucfirst($modelName) . ' ' . $event,
        };

        $name = $this->name ?? $this->title ?? $this->number ?? null;
        if ($name) {
            $description .= ": {$name}";
        }

        try {
            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => $action,
                'description' => $description,
                'model_type' => static::class,
                'model_id' => $this->getKey(),
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]);
        } catch (\Exception $e) {
            // Don't break the application if audit logging fails
            \Log::warning('Audit log failed: ' . $e->getMessage());
        }
    }
}
