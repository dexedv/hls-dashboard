<?php

use App\Http\Controllers\Controller;
use App\Services\SupabaseService;
use Illuminate\Support\Facades\Route;

Route::get('/test-supabase', function () {
    try {
        $supabase = new SupabaseService();
        // Try to get tables list - this will fail but tests connection
        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'apikey' => $supabase->anonKey,
            'Authorization' => 'Bearer ' . $supabase->anonKey,
        ])->get($supabase->url . '/rest/v1/');

        return response()->json([
            'status' => $response->successful() ? 'connected' : 'error',
            'response' => $response->body(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ]);
    }
});
