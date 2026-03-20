<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Auditable;

class Customer extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'name',
        'company',
        'email',
        'phone',
        'address',
        'notes',
        'category',
        'revenue',
        'created_by',
        'user_id',
        // Additional fields for Lexware sync
        'industry',
        'tax_number',
        'vat_id',
        'postal_code',
        'city',
        'country',
        // Lexware sync fields
        'lexware_id',
        'lexware_customer_number',
        'sync_status',
        'last_synced_at',
    ];

    protected $casts = [
        'revenue' => 'decimal:2',
        'last_synced_at' => 'datetime',
    ];

    /**
     * Get the user who created this customer
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get projects for this customer
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get leads for this customer
     */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }
}
