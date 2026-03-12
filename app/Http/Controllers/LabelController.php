<?php

namespace App\Http\Controllers;

use App\Models\Label;
use App\Repositories\SupabaseRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabelController extends Controller
{
    public function index()
    {
        $useSupabase = filter_var(env('USE_SUPABASE', false), FILTER_VALIDATE_BOOLEAN);

        if ($useSupabase) {
            try {
                $labels = SupabaseRepository::labels()->get()->toArray();
            } catch (\Exception $e) {
                $labels = [];
            }
        }

        // Fallback to default labels if empty
        if (empty($labels)) {
            $labels = [
                ['id' => 1, 'name' => 'Außendienst', 'color' => '#3b82f6', 'slug' => 'aussendienst'],
                ['id' => 2, 'name' => 'Innendienst', 'color' => '#10b981', 'slug' => 'innendienst'],
                ['id' => 3, 'name' => 'Produktion', 'color' => '#f59e0b', 'slug' => 'produktion'],
                ['id' => 4, 'name' => 'Support', 'color' => '#8b5cf6', 'slug' => 'support'],
                ['id' => 5, 'name' => 'Buchhaltung', 'color' => '#ec4899', 'slug' => 'buchhaltung'],
                ['id' => 6, 'name' => 'Vertrieb', 'color' => '#ef4444', 'slug' => 'vertrieb'],
            ];
        }

        return Inertia::render('Labels/Index', [
            'labels' => $labels,
        ]);
    }
}
