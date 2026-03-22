<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\Auditable;

class Inventory extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'sku',
        'name',
        'description',
        'category_id',
        'unit',
        'min_stock',
        'current_stock',
        'location',
        'barcode',
        'unit_price',
    ];

    protected $casts = [
        'min_stock' => 'integer',
        'current_stock' => 'integer',
        'unit_price' => 'decimal:2',
    ];

    /**
     * Check if stock is below minimum
     */
    public function isLowStock(): bool
    {
        return $this->current_stock <= $this->min_stock;
    }

    /**
     * Get movements for this item
     */
    public function movements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class, 'item_id');
    }
}
