<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class License extends Model
{
    protected $fillable = [
        'license_key',
        'licensed_to',
        'licensed_email',
        'plan',
        'max_users',
        'features',
        'valid_until',
        'activated_at',
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'valid_until' => 'date',
            'activated_at' => 'datetime',
            'max_users' => 'integer',
        ];
    }

    public function isValid(): bool
    {
        return $this->activated_at !== null && !$this->isExpired();
    }

    public function isExpired(): bool
    {
        if ($this->valid_until === null) {
            return false; // Lifetime license
        }

        return $this->valid_until->isPast();
    }

    public function canAddUser(): bool
    {
        $currentUsers = User::count();
        return $currentUsers < $this->max_users;
    }

    public function hasFeature(string $feature): bool
    {
        if (empty($this->features)) {
            return true; // No feature restrictions
        }

        return in_array($feature, $this->features);
    }

    public function getUserLimit(): int
    {
        return $this->max_users;
    }

    public function getPlan(): string
    {
        return $this->plan;
    }
}
