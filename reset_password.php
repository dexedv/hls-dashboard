<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\SupabaseService;
use Illuminate\Support\Facades\Hash;

$supabase = new SupabaseService();
$serviceKey = config('services.supabase.service_key');

// Password hash für "Error404.1002"
$password = Hash::make('Error404.1002');

echo "Password hash: " . $password . "\n";

// Update user in Supabase
$response = \Illuminate\Support\Facades\Http::withHeaders([
    'apikey' => $serviceKey,
    'Authorization' => 'Bearer ' . $serviceKey,
    'Content-Type' => 'application/json',
    'Prefer' => 'return=representation',
])->withOptions(['verify' => false])
  ->patch(config('services.supabase.url') . '/rest/v1/users?email=eq.dominic.kluegl@outlook.de', [
    'password' => $password,
  ]);

echo "Response: " . $response->status() . "\n";
echo $response->body() . "\n";
