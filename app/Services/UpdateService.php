<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class UpdateService
{
    public function check(): array
    {
        $current = config('app.version', '1.0.0');
        $url = env('UPDATE_CHECK_URL');

        if (empty($url)) {
            return [
                'current' => $current,
                'latest' => $current,
                'update_available' => false,
                'error' => 'Keine Update-URL konfiguriert.',
            ];
        }

        try {
            $response = Http::timeout(10)->get($url);

            if ($response->successful()) {
                $data = $response->json();
                $latest = $data['version'] ?? $current;

                return [
                    'current' => $current,
                    'latest' => $latest,
                    'update_available' => version_compare($latest, $current, '>'),
                    'changelog_url' => $data['changelog_url'] ?? null,
                ];
            }

            return [
                'current' => $current,
                'latest' => $current,
                'update_available' => false,
                'error' => 'Update-Server nicht erreichbar.',
            ];
        } catch (\Exception $e) {
            return [
                'current' => $current,
                'latest' => $current,
                'update_available' => false,
                'error' => 'Verbindung fehlgeschlagen: ' . $e->getMessage(),
            ];
        }
    }
}
