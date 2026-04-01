<?php

namespace App\Models;

use App\Models\DocumentFolder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Auditable;

class Project extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'name',
        'description',
        'status',
        'priority',
        'progress',
        'budget',
        'start_date',
        'end_date',
        'archived_at',
        'customer_id',
        'created_by',
        'assigned_to',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'archived_at' => 'datetime',
    ];

    /**
     * Get the customer for this project
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the user who created this project
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user');
    }

    /**
     * Get tasks for this project
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get time entries for this project
     */
    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class);
    }

    public function folders(): MorphMany
    {
        return $this->morphMany(DocumentFolder::class, 'folderable');
    }

    /**
     * Recalculate progress based on completed tasks.
     */
    public function recalculateProgress(): void
    {
        $total = $this->tasks()->count();
        if ($total === 0) {
            $this->updateQuietly(['progress' => 0]);
            return;
        }
        $done = $this->tasks()->where('status', 'done')->count();
        $this->updateQuietly(['progress' => (int) round($done / $total * 100)]);
    }
}
