<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class SupabaseService
{
    protected string $url;
    protected string $anonKey;
    protected string $table;
    protected ?int $limit = null;

    public function __construct()
    {
        $this->url = config('services.supabase.url', 'https://ebttwowzsltieychkldz.supabase.co');
        $this->anonKey = config('services.supabase.anon_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVidHR3b3d6c2x0aWV5Y2hrbGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjczMDcsImV4cCI6MjA4ODg0MzMwN30.sT2Gh6t9aeMs-XJVX5fw6kFmT2OTEtcoANL19Ygb_Bo');
    }

    public function setLimit(int $limit): self
    {
        $this->limit = $limit;
        return $this;
    }

    public function getLimit(): ?int
    {
        return $this->limit;
    }

    /**
     * Set the table to query
     */
    public function table(string $table): self
    {
        $this->table = $table;
        return $this;
    }

    /**
     * Get all records from a table
     */
    public function get(string $table = null): \Illuminate\Support\Collection
    {
        $table = $table ?? $this->table;

        $params = [];
        if ($this->limit !== null) {
            $params['limit'] = $this->limit;
            $this->limit = null; // Reset after use
        }

        $response = Http::withHeaders([
            'apikey' => $this->anonKey,
            'Authorization' => 'Bearer ' . $this->anonKey,
        ])->withOptions(['verify' => false])->get("{$this->url}/rest/v1/{$table}", $params);

        if ($response->failed()) {
            throw new \Exception("Supabase request failed: " . $response->body());
        }

        return collect($response->json());
    }

    /**
     * Get a single record by ID
     */
    public function find(int $id, string $table = null): ?array
    {
        $table = $table ?? $this->table;

        $response = Http::withHeaders([
            'apikey' => $this->anonKey,
            'Authorization' => 'Bearer ' . $this->anonKey,
        ])->withOptions(['verify' => false])->get("{$this->url}/rest/v1/{$table}", [
            'id' => 'eq.' . $id,
            'limit' => 1,
        ]);

        if ($response->failed()) {
            throw new \Exception("Supabase request failed: " . $response->body());
        }

        $data = $response->json();
        return !empty($data) ? $data[0] : null;
    }

    /**
     * Create a new record
     */
    public function create(array $data, string $table = null): array
    {
        $table = $table ?? $this->table;

        $response = Http::withHeaders([
            'apikey' => $this->anonKey,
            'Authorization' => 'Bearer ' . $this->anonKey,
            'Content-Type' => 'application/json',
            'Prefer' => 'return=representation',
        ])->withOptions(['verify' => false])->post("{$this->url}/rest/v1/{$table}", $data);

        if ($response->failed()) {
            throw new \Exception("Supabase request failed: " . $response->body());
        }

        return $response->json()[0] ?? $response->json();
    }

    /**
     * Update a record by ID
     */
    public function update($id, array $data, string $table = null): array
    {
        $table = $table ?? $this->table;

        $response = Http::withHeaders([
            'apikey' => $this->anonKey,
            'Authorization' => 'Bearer ' . $this->anonKey,
            'Content-Type' => 'application/json',
            'Prefer' => 'return=representation',
        ])->withOptions(['verify' => false])->patch("{$this->url}/rest/v1/{$table}?id=eq.{$id}", $data);

        if ($response->failed()) {
            throw new \Exception("Supabase request failed: " . $response->body());
        }

        return $response->json()[0] ?? $response->json();
    }

    /**
     * Delete a record by ID
     */
    public function delete($id, string $table = null): bool
    {
        $table = $table ?? $this->table;

        $response = Http::withHeaders([
            'apikey' => $this->anonKey,
            'Authorization' => 'Bearer ' . $this->anonKey,
        ])->withOptions(['verify' => false])->delete("{$this->url}/rest/v1/{$table}?id=eq.{$id}");

        return !$response->failed();
    }

    /**
     * Query with filters
     */
    public function where(string $column, string $operator, mixed $value, string $table = null): \Illuminate\Support\Collection
    {
        $table = $table ?? $this->table;

        // Handle whereIn - convert array to "in" operator with parentheses
        if (is_array($value)) {
            $value = '(' . implode(',', $value) . ')';
            $operator = 'in';
        }

        $params = [$column => $operator . '.' . $value];
        if ($this->limit !== null) {
            $params['limit'] = $this->limit;
            $this->limit = null; // Reset after use
        }

        $response = Http::withHeaders([
            'apikey' => $this->anonKey,
            'Authorization' => 'Bearer ' . $this->anonKey,
        ])->withOptions(['verify' => false])->get("{$this->url}/rest/v1/{$table}", $params);

        if ($response->failed()) {
            throw new \Exception("Supabase request failed: " . $response->body());
        }

        return collect($response->json());
    }

    /**
     * Insert multiple records
     */
    public function insert(array $records, string $table = null): bool
    {
        $table = $table ?? $this->table;

        $response = Http::withHeaders([
            'apikey' => $this->anonKey,
            'Authorization' => 'Bearer ' . $this->anonKey,
            'Content-Type' => 'application/json',
            'Prefer' => 'return=minimal',
        ])->withOptions(['verify' => false])->post("{$this->url}/rest/v1/{$table}", $records);

        return !$response->failed();
    }
}
