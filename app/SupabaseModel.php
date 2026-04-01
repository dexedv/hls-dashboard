<?php

namespace App;

use App\Services\SupabaseService;
use Illuminate\Database\Eloquent\Model as EloquentModel;

abstract class SupabaseModel extends EloquentModel
{
    protected static $supabase;
    protected static string $supabaseTable;

    public static function bootSupabaseModel()
    {
        static::setUpStatic();
    }

    protected static function setUpStatic()
    {
        if (!isset(self::$supabase)) {
            self::$supabase = new SupabaseService();
        }
    }

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->table = static::$supabaseTable ?? $this->table;
    }

    public static function getSupabase(): SupabaseService
    {
        if (!isset(self::$supabase)) {
            self::$supabase = new SupabaseService();
        }
        return self::$supabase;
    }

    public static function all($columns = ['*'])
    {
        return self::getSupabase()->get(static::$supabaseTable)->map(function ($item) {
            return new static($item);
        });
    }

    public static function find($id)
    {
        $data = self::getSupabase()->find($id, static::$supabaseTable);
        return $data ? new static($data) : null;
    }

    public static function create(array $attributes)
    {
        $model = new static($attributes);
        $model->save();
        return $model;
    }

    public function save(array $options = [])
    {
        $data = $this->getAttributes();

        if (isset($data['id']) && $data['id']) {
            self::getSupabase()->update($data['id'], $data, static::$supabaseTable);
        } else {
            $result = self::getSupabase()->create($data, static::$supabaseTable);
            $this->setAttribute('id', $result['id'] ?? null);
        }

        return true;
    }

    public static function count(): int
    {
        return self::getSupabase()->get(static::$supabaseTable)->count();
    }

    public static function where($column, $operator = null, $value = null)
    {
        $supabase = self::getSupabase();

        if (is_array($column)) {
            // Where clause array
            $results = $supabase->get(static::$supabaseTable);
            foreach ($column as $col => $val) {
                $results = $results->where($col, $val);
            }
            return $results->map(fn($item) => new static($item));
        }

        // Handle where(column, value) syntax
        if ($value === null) {
            $value = $operator;
            $operator = 'eq';
        }

        return $supabase->where($column, $operator, $value, static::$supabaseTable)
            ->map(fn($item) => new static($item));
    }
}
