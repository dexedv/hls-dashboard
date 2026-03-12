<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Repositories\SupabaseRepository;

class LabelSeeder extends Seeder
{
    public function run(): void
    {
        // Only run if using Supabase
        if (!config('services.supabase.url')) {
            return;
        }

        $labels = [
            [
                'name' => 'Außendienst',
                'slug' => 'aussendienst',
                'color' => '#10b981',
                'description' => 'Mitarbeiter im Außendienst',
            ],
            [
                'name' => 'Innendienst',
                'slug' => 'innendienst',
                'color' => '#3b82f6',
                'description' => 'Mitarbeiter im Innendienst',
            ],
            [
                'name' => 'Techniker',
                'slug' => 'techniker',
                'color' => '#f59e0b',
                'description' => 'Technisches Personal',
            ],
            [
                'name' => 'Vertrieb',
                'slug' => 'vertrieb',
                'color' => '#8b5cf6',
                'description' => 'Vertriebsmitarbeiter',
            ],
            [
                'name' => 'Support',
                'slug' => 'support',
                'color' => '#ec4899',
                'description' => 'Kundensupport',
            ],
            [
                'name' => ' Verwaltung',
                'slug' => 'verwaltung',
                'color' => '#6b7280',
                'description' => 'Verwaltungspersonal',
            ],
        ];

        foreach ($labels as $label) {
            try {
                SupabaseRepository::labels()->create($label);
            } catch (\Exception $e) {
                // Label might already exist
            }
        }
    }
}
