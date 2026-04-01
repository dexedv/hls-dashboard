<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Auditable;

class Quote extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'number',
        'customer_id',
        'project_id',
        'status',
        'subtotal',
        'tax',
        'total',
        'valid_until',
        'archived_at',
        'notes',
        'created_by',
        // Lexware sync fields
        'lexware_id',
        'lexware_status',
        'last_synced_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'valid_until' => 'date',
        'archived_at' => 'datetime',
        'last_synced_at' => 'datetime',
    ];

    /**
     * Get the customer for this quote
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the project for this quote
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who created this quote
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get quote items
     */
    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }
}

class QuoteItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'quote_id',
        'description',
        'quantity',
        'unit_price',
        'total',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    /**
     * Get the quote for this item
     */
    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }
}
