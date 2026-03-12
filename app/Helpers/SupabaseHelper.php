<?php

namespace App\Helpers;

use App\Repositories\SupabaseRepository;
use Illuminate\Database\Eloquent\Model;

class SupabaseHelper
{
    public static function useSupabase(): bool
    {
        return filter_var(env('USE_SUPABASE', false), FILTER_VALIDATE_BOOLEAN);
    }

    // Convert Supabase collection to paginated response
    public static function toPaginated($collection, $perPage = 10)
    {
        $page = request()->get('page', 1);
        $total = $collection->count();
        $data = $collection->forPage($page, $perPage)->values();

        return [
            'data' => $data,
            'current_page' => $page,
            'last_page' => ceil($total / $perPage),
            'per_page' => $perPage,
            'total' => $total,
            'links' => self::generateLinks($page, ceil($total / $perPage)),
        ];
    }

    private static function generateLinks($current, $last)
    {
        $links = [];
        for ($i = 1; $i <= $last; $i++) {
            $links[] = [
                'url' => request()->url() . '?page=' . $i,
                'label' => $i,
                'active' => $i == $current,
            ];
        }
        return $links;
    }

    // Get base URL for pagination
    private static function baseUrl()
    {
        return request()->url();
    }
}
