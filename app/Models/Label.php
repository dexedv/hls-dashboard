<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Label extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_labels', 'user_id', 'label_id');
    }
}
