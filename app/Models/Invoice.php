<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Auditable;

class Invoice extends Model
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
        'issue_date',
        'due_date',
        'sent_at',
        'paid_at',
        'archived_at',
        'notes',
        'created_by',
        // Lexware sync fields
        'lexware_id',
        'lexware_status',
        'last_synced_at',
        // Recurring
        'is_recurring',
        'recurring_interval',
        'recurring_next_date',
        'recurring_end_date',
        'recurring_parent_id',
        // Currency
        'currency',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'issue_date' => 'date',
        'due_date' => 'date',
        'sent_at' => 'datetime',
        'paid_at' => 'datetime',
        'archived_at' => 'datetime',
        'last_synced_at' => 'datetime',
        'is_recurring' => 'boolean',
        'recurring_next_date' => 'date',
        'recurring_end_date' => 'date',
    ];

    /**
     * Get the customer for this invoice
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the project for this invoice
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who created this invoice
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get invoice items
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }
}

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
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
     * Get the invoice for this item
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
