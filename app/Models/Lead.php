<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'company',
        'email',
        'phone',
        'value',
        'status',
        'source',
        'customer_id',
        'created_by',
    ];

    protected $casts = [
        'value' => 'decimal:2',
    ];

    /**
     * Get the customer associated with this lead
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the user who created this lead
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Convert lead to customer
     */
    public function convertToCustomer(): Customer
    {
        $customer = Customer::create([
            'name' => $this->name,
            'company' => $this->company,
            'email' => $this->email,
            'phone' => $this->phone,
            'created_by' => $this->created_by,
        ]);

        $this->update([
            'customer_id' => $customer->id,
            'status' => 'won',
        ]);

        return $customer;
    }
}
