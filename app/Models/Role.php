<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_system_role',
    ];

    protected $casts = [
        'is_system_role' => 'boolean',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'role_id');
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permissions')
            ->withPivot('allowed');
    }

    public function hasPermission(string $permission): bool
    {
        $permission = $this->permissions()
            ->where('key', $permission)
            ->first();

        return $permission && $permission->pivot->allowed;
    }
}
