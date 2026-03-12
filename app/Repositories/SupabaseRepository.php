<?php

namespace App\Repositories;

use App\Services\SupabaseService;
use Illuminate\Support\Collection;

class SupabaseRepository
{
    protected SupabaseService $supabase;
    protected string $table;

    public function __construct(string $table)
    {
        $this->supabase = new SupabaseService();
        $this->table = $table;
    }

    public function all(): Collection
    {
        return $this->supabase->get($this->table);
    }

    public function find(int $id): ?array
    {
        return $this->supabase->find($id, $this->table);
    }

    public function create(array $data): array
    {
        return $this->supabase->create($data, $this->table);
    }

    public function update(int $id, array $data): array
    {
        return $this->supabase->update($id, $data, $this->table);
    }

    public function delete(int $id): bool
    {
        return $this->supabase->delete($id, $this->table);
    }

    public function where(string $column, $value): Collection
    {
        return $this->supabase->where($column, 'eq', $value, $this->table);
    }

    public function whereIn(string $column, array $values): Collection
    {
        return $this->supabase->where($column, 'in', $values, $this->table);
    }

    public function limit(int $count): self
    {
        $this->supabase->setLimit($count);
        return $this;
    }

    public function get(): Collection
    {
        return $this->supabase->get($this->table);
    }

    public function count(): int
    {
        return $this->all()->count();
    }

    // Factory methods for common tables
    public static function customers(): self { return new self('customers'); }
    public static function leads(): self { return new self('leads'); }
    public static function projects(): self { return new self('projects'); }
    public static function tasks(): self { return new self('tasks'); }
    public static function invoices(): self { return new self('invoices'); }
    public static function quotes(): self { return new self('quotes'); }
    public static function tickets(): self { return new self('tickets'); }
    public static function timeEntries(): self { return new self('time_entries'); }
    public static function events(): self { return new self('events'); }
    public static function notes(): self { return new self('notes'); }
    public static function inventories(): self { return new self('inventories'); }
    public static function transactions(): self { return new self('transactions'); }
    public static function users(): self { return new self('users'); }
    public static function leaveRequests(): self { return new self('leave_requests'); }
    public static function labels(): self { return new self('labels'); }
    public static function userLabels(): self { return new self('user_labels'); }
    public static function userPermissions(): self { return new self('user_permissions'); }
    public static function auditLogs(): self { return new self('audit_logs'); }
    public static function roles(): self { return new self('roles'); }
    public static function permissions(): self { return new self('permissions'); }
    public static function inventoryMovements(): self { return new self('inventory_movements'); }
}
